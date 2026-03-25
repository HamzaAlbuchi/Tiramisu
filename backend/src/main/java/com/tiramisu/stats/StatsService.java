package com.tiramisu.stats;

import com.tiramisu.entity.DebateRecord;
import com.tiramisu.entity.DebateRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {

    private final DebateRecordRepository repo;

    public StatsService(DebateRecordRepository repo) {
        this.repo = repo;
    }

    public StatsResponse getStats() {
        StatsResponse out = new StatsResponse();

        long total = repo.count();
        out.setTotalDebates((int) Math.min(Integer.MAX_VALUE, total));
        out.setTotalDebatesLast30Days((int) Math.min(Integer.MAX_VALUE,
                repo.countByCreatedAtAfter(LocalDateTime.now().minusDays(30))));

        Map<String, Acc> byModel = new HashMap<String, Acc>();

        // Wins/losses/draws + head-to-head
        Map<String, StatsResponse.HeadToHead> h2h = new HashMap<String, StatsResponse.HeadToHead>();
        List<Object[]> rows = repo.countByProModelLabelAndAgainstModelLabel();
        for (Object[] r : rows) {
            String pro = asStr(r[0]);
            String against = asStr(r[1]);
            String winner = asStr(r[2]); // pro|against|draw
            int cnt = asInt(r[3]);

            addAppearance(byModel, pro, cnt);
            addAppearance(byModel, against, cnt);

            if ("pro".equalsIgnoreCase(winner)) {
                addWin(byModel, pro, cnt);
                addLoss(byModel, against, cnt);
            } else if ("against".equalsIgnoreCase(winner)) {
                addWin(byModel, against, cnt);
                addLoss(byModel, pro, cnt);
            } else {
                addDraw(byModel, pro, cnt);
                addDraw(byModel, against, cnt);
            }

            String key = safe(pro) + "||" + safe(against);
            StatsResponse.HeadToHead e = h2h.get(key);
            if (e == null) {
                e = new StatsResponse.HeadToHead();
                e.setProModel(pro);
                e.setAgainstModel(against);
                h2h.put(key, e);
            }
            if ("pro".equalsIgnoreCase(winner)) {
                e.setProWins(e.getProWins() + cnt);
            } else if ("against".equalsIgnoreCase(winner)) {
                e.setAgainstWins(e.getAgainstWins() + cnt);
            } else {
                e.setDraws(e.getDraws() + cnt);
            }
        }

        // Avg scores (we store in a pro/against split; compute weighted averages by appearances)
        // For initial version: approximate by taking mean of pro-side and against-side separately, then combine.
        // TODO: Add Redis caching for stats
        //       queries at scale
        // TODO: Add date range filter parameter
        // TODO: Add per-user stats when auth added
        List<DebateRecord> sample = repo.findTop20ByOrderByCreatedAtDesc();
        for (DebateRecord r : sample) {
            // pro
            Acc ap = getAcc(byModel, r.getProModelLabel());
            ap.addScores(r.getProAccuracy(), r.getProLogic(), r.getProEvidence(), r.getProConsistency(), r.getProRhetoric());
            // against
            Acc aa = getAcc(byModel, r.getAgainstModelLabel());
            aa.addScores(r.getAgainstAccuracy(), r.getAgainstLogic(), r.getAgainstEvidence(), r.getAgainstConsistency(), r.getAgainstRhetoric());
        }

        List<StatsResponse.ModelStats> leaderboard = new ArrayList<StatsResponse.ModelStats>();
        for (Map.Entry<String, Acc> e : byModel.entrySet()) {
            String label = e.getKey();
            Acc a = e.getValue();
            StatsResponse.ModelStats ms = new StatsResponse.ModelStats();
            ms.setModelLabel(label);
            ms.setTotalDebates(a.total);
            ms.setWins(a.wins);
            ms.setLosses(a.losses);
            ms.setDraws(a.draws);
            ms.setWinRate(a.total > 0 ? (double) a.wins / (double) a.total : 0.0);
            ms.setAvgAccuracy(a.avgAccuracy());
            ms.setAvgLogic(a.avgLogic());
            ms.setAvgEvidence(a.avgEvidence());
            ms.setAvgConsistency(a.avgConsistency());
            ms.setAvgRhetoric(a.avgRhetoric());
            leaderboard.add(ms);
        }
        Collections.sort(leaderboard, new Comparator<StatsResponse.ModelStats>() {
            @Override
            public int compare(StatsResponse.ModelStats o1, StatsResponse.ModelStats o2) {
                return Double.compare(o2.getWinRate(), o1.getWinRate());
            }
        });
        out.setLeaderboard(leaderboard);

        out.setHeadToHead(new ArrayList<StatsResponse.HeadToHead>(h2h.values()));

        // Verdict distribution
        Map<String, Integer> verdictCounts = new HashMap<String, Integer>();
        for (Object[] r : repo.countByVerdictType()) {
            verdictCounts.put(safe(asStr(r[0])), asInt(r[1]));
        }
        int decisive = getCount(verdictCounts, "decisive");
        int narrow = getCount(verdictCounts, "narrow");
        int draw = getCount(verdictCounts, "draw");
        int sum = decisive + narrow + draw;
        out.getVerdictDistribution().getDecisive().setCount(decisive);
        out.getVerdictDistribution().getNarrow().setCount(narrow);
        out.getVerdictDistribution().getDraw().setCount(draw);
        out.getVerdictDistribution().getDecisive().setPercentage(pct(decisive, sum));
        out.getVerdictDistribution().getNarrow().setPercentage(pct(narrow, sum));
        out.getVerdictDistribution().getDraw().setPercentage(pct(draw, sum));

        // Bias frequency (HIGH/MEDIUM only per spec)
        applyBias(out.getBiasStats(), "framing", repo.countByBiasFraming());
        applyBias(out.getBiasStats(), "omission", repo.countByBiasOmission());
        applyBias(out.getBiasStats(), "authority", repo.countByBiasAuthority());
        applyBias(out.getBiasStats(), "recency", repo.countByBiasRecency());

        // Topics
        Map<String, Map<String, Integer>> topicWin = new HashMap<String, Map<String, Integer>>();
        for (Object[] r : repo.topicWinnerCounts()) {
            String topic = safe(asStr(r[0]));
            String winner = safe(asStr(r[1]));
            int cnt = asInt(r[2]);
            Map<String, Integer> m = topicWin.get(topic);
            if (m == null) {
                m = new HashMap<String, Integer>();
                topicWin.put(topic, m);
            }
            m.put(winner, (m.containsKey(winner) ? m.get(winner) : 0) + cnt);
        }

        List<StatsResponse.TopicStat> topics = new ArrayList<StatsResponse.TopicStat>();
        List<Object[]> topicStats = repo.topicStats();
        int limit = Math.min(10, topicStats.size());
        for (int i = 0; i < limit; i++) {
            Object[] r = topicStats.get(i);
            String topic = asStr(r[0]);
            int cnt = asInt(r[1]);
            double avgConf = asDouble(r[2]);
            StatsResponse.TopicStat ts = new StatsResponse.TopicStat();
            ts.setTopic(topic);
            ts.setDebateCount(cnt);
            ts.setAvgConfidence(avgConf);
            ts.setMostCommonWinner(mostCommonWinner(topicWin.get(safe(topic))));
            topics.add(ts);
        }
        out.setTopTopics(topics);

        // Recent debates
        List<StatsResponse.RecentDebate> recent = new ArrayList<StatsResponse.RecentDebate>();
        for (DebateRecord r : repo.findTop20ByOrderByCreatedAtDesc()) {
            StatsResponse.RecentDebate rd = new StatsResponse.RecentDebate();
            rd.setRecordId(r.getRecordId());
            rd.setTopic(r.getTopic());
            rd.setProModel(r.getProModelLabel());
            rd.setAgainstModel(r.getAgainstModelLabel());
            rd.setWinner(r.getWinner());
            rd.setWinnerLabel(r.getWinnerLabel());
            rd.setConfidence(r.getConfidence());
            rd.setVerdictType(r.getVerdictType());
            rd.setCreatedAt(r.getCreatedAt());
            recent.add(rd);
        }
        out.setRecentDebates(recent);

        return out;
    }

    private static void applyBias(StatsResponse.BiasStats out, String kind, List<Object[]> rows) {
        int high = 0;
        int med = 0;
        for (Object[] r : rows) {
            String level = safe(asStr(r[0])).toUpperCase();
            int cnt = asInt(r[1]);
            if ("HIGH".equals(level)) {
                high += cnt;
            } else if ("MEDIUM".equals(level) || "MED".equals(level)) {
                med += cnt;
            }
        }
        if ("framing".equals(kind)) {
            out.setFramingHigh(high);
            out.setFramingMedium(med);
        } else if ("omission".equals(kind)) {
            out.setOmissionHigh(high);
            out.setOmissionMedium(med);
        } else if ("authority".equals(kind)) {
            out.setAuthorityHigh(high);
            out.setAuthorityMedium(med);
        } else if ("recency".equals(kind)) {
            out.setRecencyHigh(high);
            out.setRecencyMedium(med);
        }
    }

    private static String mostCommonWinner(Map<String, Integer> m) {
        if (m == null || m.isEmpty()) {
            return "n/a";
        }
        String best = null;
        int bestCnt = -1;
        for (Map.Entry<String, Integer> e : m.entrySet()) {
            if (e.getValue() > bestCnt) {
                bestCnt = e.getValue();
                best = e.getKey();
            }
        }
        return best != null ? best : "n/a";
    }

    private static void addAppearance(Map<String, Acc> byModel, String label, int cnt) {
        Acc a = getAcc(byModel, label);
        a.total += cnt;
    }

    private static void addWin(Map<String, Acc> byModel, String label, int cnt) {
        Acc a = getAcc(byModel, label);
        a.wins += cnt;
    }

    private static void addLoss(Map<String, Acc> byModel, String label, int cnt) {
        Acc a = getAcc(byModel, label);
        a.losses += cnt;
    }

    private static void addDraw(Map<String, Acc> byModel, String label, int cnt) {
        Acc a = getAcc(byModel, label);
        a.draws += cnt;
    }

    private static Acc getAcc(Map<String, Acc> byModel, String label) {
        String k = safe(label);
        Acc a = byModel.get(k);
        if (a == null) {
            a = new Acc();
            byModel.put(k, a);
        }
        return a;
    }

    private static double pct(int part, int total) {
        if (total <= 0) {
            return 0.0;
        }
        return (double) part / (double) total;
    }

    private static int getCount(Map<String, Integer> m, String key) {
        Integer v = m.get(key);
        return v != null ? v : 0;
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }

    private static String asStr(Object o) {
        return o == null ? "" : String.valueOf(o);
    }

    private static int asInt(Object o) {
        if (o == null) {
            return 0;
        }
        if (o instanceof Number) {
            return ((Number) o).intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(o));
        } catch (Exception e) {
            return 0;
        }
    }

    private static double asDouble(Object o) {
        if (o == null) {
            return 0.0;
        }
        if (o instanceof Number) {
            return ((Number) o).doubleValue();
        }
        try {
            return Double.parseDouble(String.valueOf(o));
        } catch (Exception e) {
            return 0.0;
        }
    }

    private static final class Acc {
        int total;
        int wins;
        int losses;
        int draws;
        int scoreN;
        double sumAcc;
        double sumLogic;
        double sumEvi;
        double sumCons;
        double sumRhet;

        void addScores(double acc, double logic, double evi, double cons, double rhet) {
            sumAcc += acc;
            sumLogic += logic;
            sumEvi += evi;
            sumCons += cons;
            sumRhet += rhet;
            scoreN += 1;
        }

        double avgAccuracy() {
            return scoreN > 0 ? sumAcc / (double) scoreN : 0.0;
        }

        double avgLogic() {
            return scoreN > 0 ? sumLogic / (double) scoreN : 0.0;
        }

        double avgEvidence() {
            return scoreN > 0 ? sumEvi / (double) scoreN : 0.0;
        }

        double avgConsistency() {
            return scoreN > 0 ? sumCons / (double) scoreN : 0.0;
        }

        double avgRhetoric() {
            return scoreN > 0 ? sumRhet / (double) scoreN : 0.0;
        }
    }
}

