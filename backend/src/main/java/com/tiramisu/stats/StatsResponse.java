package com.tiramisu.stats;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class StatsResponse {

    private int totalDebates;
    private int totalDebatesLast30Days;
    private List<ModelStats> leaderboard = new ArrayList<ModelStats>();
    private List<HeadToHead> headToHead = new ArrayList<HeadToHead>();
    private VerdictDistribution verdictDistribution = new VerdictDistribution();
    private BiasStats biasStats = new BiasStats();
    private List<TopicStat> topTopics = new ArrayList<TopicStat>();
    private List<RecentDebate> recentDebates = new ArrayList<RecentDebate>();

    public int getTotalDebates() {
        return totalDebates;
    }

    public void setTotalDebates(int totalDebates) {
        this.totalDebates = totalDebates;
    }

    public int getTotalDebatesLast30Days() {
        return totalDebatesLast30Days;
    }

    public void setTotalDebatesLast30Days(int totalDebatesLast30Days) {
        this.totalDebatesLast30Days = totalDebatesLast30Days;
    }

    public List<ModelStats> getLeaderboard() {
        return leaderboard;
    }

    public void setLeaderboard(List<ModelStats> leaderboard) {
        this.leaderboard = leaderboard;
    }

    public List<HeadToHead> getHeadToHead() {
        return headToHead;
    }

    public void setHeadToHead(List<HeadToHead> headToHead) {
        this.headToHead = headToHead;
    }

    public VerdictDistribution getVerdictDistribution() {
        return verdictDistribution;
    }

    public void setVerdictDistribution(VerdictDistribution verdictDistribution) {
        this.verdictDistribution = verdictDistribution;
    }

    public BiasStats getBiasStats() {
        return biasStats;
    }

    public void setBiasStats(BiasStats biasStats) {
        this.biasStats = biasStats;
    }

    public List<TopicStat> getTopTopics() {
        return topTopics;
    }

    public void setTopTopics(List<TopicStat> topTopics) {
        this.topTopics = topTopics;
    }

    public List<RecentDebate> getRecentDebates() {
        return recentDebates;
    }

    public void setRecentDebates(List<RecentDebate> recentDebates) {
        this.recentDebates = recentDebates;
    }

    public static class ModelStats {
        private String modelLabel;
        private int totalDebates;
        private int wins;
        private int losses;
        private int draws;
        private double winRate;
        private double avgAccuracy;
        private double avgLogic;
        private double avgEvidence;
        private double avgConsistency;
        private double avgRhetoric;

        public String getModelLabel() {
            return modelLabel;
        }

        public void setModelLabel(String modelLabel) {
            this.modelLabel = modelLabel;
        }

        public int getTotalDebates() {
            return totalDebates;
        }

        public void setTotalDebates(int totalDebates) {
            this.totalDebates = totalDebates;
        }

        public int getWins() {
            return wins;
        }

        public void setWins(int wins) {
            this.wins = wins;
        }

        public int getLosses() {
            return losses;
        }

        public void setLosses(int losses) {
            this.losses = losses;
        }

        public int getDraws() {
            return draws;
        }

        public void setDraws(int draws) {
            this.draws = draws;
        }

        public double getWinRate() {
            return winRate;
        }

        public void setWinRate(double winRate) {
            this.winRate = winRate;
        }

        public double getAvgAccuracy() {
            return avgAccuracy;
        }

        public void setAvgAccuracy(double avgAccuracy) {
            this.avgAccuracy = avgAccuracy;
        }

        public double getAvgLogic() {
            return avgLogic;
        }

        public void setAvgLogic(double avgLogic) {
            this.avgLogic = avgLogic;
        }

        public double getAvgEvidence() {
            return avgEvidence;
        }

        public void setAvgEvidence(double avgEvidence) {
            this.avgEvidence = avgEvidence;
        }

        public double getAvgConsistency() {
            return avgConsistency;
        }

        public void setAvgConsistency(double avgConsistency) {
            this.avgConsistency = avgConsistency;
        }

        public double getAvgRhetoric() {
            return avgRhetoric;
        }

        public void setAvgRhetoric(double avgRhetoric) {
            this.avgRhetoric = avgRhetoric;
        }
    }

    public static class HeadToHead {
        private String proModel;
        private String againstModel;
        private int proWins;
        private int againstWins;
        private int draws;

        public String getProModel() {
            return proModel;
        }

        public void setProModel(String proModel) {
            this.proModel = proModel;
        }

        public String getAgainstModel() {
            return againstModel;
        }

        public void setAgainstModel(String againstModel) {
            this.againstModel = againstModel;
        }

        public int getProWins() {
            return proWins;
        }

        public void setProWins(int proWins) {
            this.proWins = proWins;
        }

        public int getAgainstWins() {
            return againstWins;
        }

        public void setAgainstWins(int againstWins) {
            this.againstWins = againstWins;
        }

        public int getDraws() {
            return draws;
        }

        public void setDraws(int draws) {
            this.draws = draws;
        }
    }

    public static class VerdictDistribution {
        private Bucket decisive = new Bucket();
        private Bucket narrow = new Bucket();
        private Bucket draw = new Bucket();

        public Bucket getDecisive() {
            return decisive;
        }

        public void setDecisive(Bucket decisive) {
            this.decisive = decisive;
        }

        public Bucket getNarrow() {
            return narrow;
        }

        public void setNarrow(Bucket narrow) {
            this.narrow = narrow;
        }

        public Bucket getDraw() {
            return draw;
        }

        public void setDraw(Bucket draw) {
            this.draw = draw;
        }
    }

    public static class Bucket {
        private int count;
        private double percentage;

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
    }

    public static class BiasStats {
        private int framingHigh;
        private int framingMedium;
        private int omissionHigh;
        private int omissionMedium;
        private int authorityHigh;
        private int authorityMedium;
        private int recencyHigh;
        private int recencyMedium;

        public int getFramingHigh() {
            return framingHigh;
        }

        public void setFramingHigh(int framingHigh) {
            this.framingHigh = framingHigh;
        }

        public int getFramingMedium() {
            return framingMedium;
        }

        public void setFramingMedium(int framingMedium) {
            this.framingMedium = framingMedium;
        }

        public int getOmissionHigh() {
            return omissionHigh;
        }

        public void setOmissionHigh(int omissionHigh) {
            this.omissionHigh = omissionHigh;
        }

        public int getOmissionMedium() {
            return omissionMedium;
        }

        public void setOmissionMedium(int omissionMedium) {
            this.omissionMedium = omissionMedium;
        }

        public int getAuthorityHigh() {
            return authorityHigh;
        }

        public void setAuthorityHigh(int authorityHigh) {
            this.authorityHigh = authorityHigh;
        }

        public int getAuthorityMedium() {
            return authorityMedium;
        }

        public void setAuthorityMedium(int authorityMedium) {
            this.authorityMedium = authorityMedium;
        }

        public int getRecencyHigh() {
            return recencyHigh;
        }

        public void setRecencyHigh(int recencyHigh) {
            this.recencyHigh = recencyHigh;
        }

        public int getRecencyMedium() {
            return recencyMedium;
        }

        public void setRecencyMedium(int recencyMedium) {
            this.recencyMedium = recencyMedium;
        }
    }

    public static class TopicStat {
        private String topic;
        private int debateCount;
        private double avgConfidence;
        private String mostCommonWinner;

        public String getTopic() {
            return topic;
        }

        public void setTopic(String topic) {
            this.topic = topic;
        }

        public int getDebateCount() {
            return debateCount;
        }

        public void setDebateCount(int debateCount) {
            this.debateCount = debateCount;
        }

        public double getAvgConfidence() {
            return avgConfidence;
        }

        public void setAvgConfidence(double avgConfidence) {
            this.avgConfidence = avgConfidence;
        }

        public String getMostCommonWinner() {
            return mostCommonWinner;
        }

        public void setMostCommonWinner(String mostCommonWinner) {
            this.mostCommonWinner = mostCommonWinner;
        }
    }

    public static class RecentDebate {
        private String recordId;
        private String topic;
        private String proModel;
        private String againstModel;
        private String winner;
        private String winnerLabel;
        private double confidence;
        private String verdictType;
        private LocalDateTime createdAt;

        public String getRecordId() {
            return recordId;
        }

        public void setRecordId(String recordId) {
            this.recordId = recordId;
        }

        public String getTopic() {
            return topic;
        }

        public void setTopic(String topic) {
            this.topic = topic;
        }

        public String getProModel() {
            return proModel;
        }

        public void setProModel(String proModel) {
            this.proModel = proModel;
        }

        public String getAgainstModel() {
            return againstModel;
        }

        public void setAgainstModel(String againstModel) {
            this.againstModel = againstModel;
        }

        public String getWinner() {
            return winner;
        }

        public void setWinner(String winner) {
            this.winner = winner;
        }

        public String getWinnerLabel() {
            return winnerLabel;
        }

        public void setWinnerLabel(String winnerLabel) {
            this.winnerLabel = winnerLabel;
        }

        public double getConfidence() {
            return confidence;
        }

        public void setConfidence(double confidence) {
            this.confidence = confidence;
        }

        public String getVerdictType() {
            return verdictType;
        }

        public void setVerdictType(String verdictType) {
            this.verdictType = verdictType;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
}

