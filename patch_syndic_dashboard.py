import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/dashboard/service/DashboardService.java", "r") as f:
    content = f.read()

new_syndic = """
    public SyndicDashboardDTO getSyndicDashboard(String email, Integer days) {
        org.springframework.security.core.userdetails.UserDetails userDetails = userRepository.findByEmail(email);
        if (!(userDetails instanceof User user)) {
            throw new IllegalArgumentException("User not found or invalid type");
        }

        if (user.getCondominium() == null) {
            throw new IllegalArgumentException("User condominium not found");
        }

        Long condominiumId = user.getCondominium().getId();

        LocalDateTime startDate = LocalDateTime.of(2000, 1, 1, 0, 0);
        if (days != null && days > 0) {
            startDate = LocalDateTime.now().minusDays(days);
        }

        List<Object[]> byStatus = occurrenceRepository.countByStatusGroupedFiltered(condominiumId, startDate);
        List<Object[]> byCategory = occurrenceRepository.countByCategoryGroupedFiltered(condominiumId, startDate);
"""

content = re.sub(
    r'public SyndicDashboardDTO getSyndicDashboard\(String email\) \{.*?List<Object\[\]> byCategory = occurrenceRepository\.countByCategoryGrouped\(condominiumId\);',
    new_syndic.strip(),
    content,
    flags=re.DOTALL
)

with open("backend/src/main/java/com/jonathanspereira/condoflow/dashboard/service/DashboardService.java", "w") as f:
    f.write(content)
