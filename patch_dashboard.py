import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/dashboard/service/DashboardService.java", "r") as f:
    content = f.read()

trend_logic = """
        // Fetch actual monthly trend data
        LocalDateTime sixMonthsAgo = now.minusMonths(5).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime queryStartDate = startDate.isAfter(sixMonthsAgo) ? startDate : sixMonthsAgo;
        List<Object[]> trendRows = occurrenceRepository.countByMonthAndStatusFiltered(searchCondoId, queryStartDate);
        
        List<DashboardStatsDTO.MonthlyTrendDTO> monthlyTrends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthTime = now.minusMonths(i);
            String monthName = monthTime.getMonth().getDisplayName(TextStyle.SHORT, new Locale("pt", "BR"));
            int targetYear = monthTime.getYear();
            int targetMonth = monthTime.getMonthValue();
            
            long monthTotal = 0;
            long monthResolved = 0;
            
            if (trendRows != null) {
                for (Object[] row : trendRows) {
                    if (row != null && row.length >= 4) {
                        int year = ((Number) row[0]).intValue();
                        int month = ((Number) row[1]).intValue();
                        if (year == targetYear && month == targetMonth) {
                            long count = ((Number) row[3]).longValue();
                            monthTotal += count;
                            OccurrenceStatus status = (OccurrenceStatus) row[2];
                            if (status == OccurrenceStatus.RESOLVED || status == OccurrenceStatus.CLOSED) {
                                monthResolved += count;
                            }
                        }
                    }
                }
            }
            monthlyTrends.add(new DashboardStatsDTO.MonthlyTrendDTO(monthName, monthTotal, monthResolved));
        }
"""

content = re.sub(
    r"// Generate monthly trend data scaled by totalOccurrences.*?monthlyTrends\.add\(new DashboardStatsDTO\.MonthlyTrendDTO\(monthName, monthTotal, monthResolved\)\);\n        }",
    trend_logic.strip(),
    content,
    flags=re.DOTALL
)

with open("backend/src/main/java/com/jonathanspereira/condoflow/dashboard/service/DashboardService.java", "w") as f:
    f.write(content)

