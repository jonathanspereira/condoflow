import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/repository/OccurrenceRepository.java", "r") as f:
    content = f.read()

new_query = """
    @Query("SELECT YEAR(o.createdAt), MONTH(o.createdAt), o.status, COUNT(o) FROM Occurrence o WHERE (:condominiumId = -1L OR (o.condominium IS NOT NULL AND o.condominium.id = :condominiumId)) AND o.createdAt >= :startDate GROUP BY YEAR(o.createdAt), MONTH(o.createdAt), o.status")
    List<Object[]> countByMonthAndStatusFiltered(@Param("condominiumId") Long condominiumId, @Param("startDate") LocalDateTime startDate);
}
"""

content = content.replace("}", new_query)

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/repository/OccurrenceRepository.java", "w") as f:
    f.write(content)
