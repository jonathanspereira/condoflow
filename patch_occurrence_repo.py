import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/repository/OccurrenceRepository.java", "r") as f:
    content = f.read()

new_queries = """
    @Query("SELECT o.status, COUNT(o) FROM Occurrence o WHERE o.condominium.id = :condominiumId GROUP BY o.status")
    List<Object[]> countByStatusGrouped(@Param("condominiumId") Long condominiumId);

    @Query("SELECT o.category, COUNT(o) FROM Occurrence o WHERE o.condominium.id = :condominiumId GROUP BY o.category")
    List<Object[]> countByCategoryGrouped(@Param("condominiumId") Long condominiumId);

    @Query("SELECT o.status, COUNT(o) FROM Occurrence o WHERE o.condominium.id = :condominiumId AND o.createdAt >= :startDate GROUP BY o.status")
    List<Object[]> countByStatusGroupedFiltered(@Param("condominiumId") Long condominiumId, @Param("startDate") java.time.LocalDateTime startDate);

    @Query("SELECT o.category, COUNT(o) FROM Occurrence o WHERE o.condominium.id = :condominiumId AND o.createdAt >= :startDate GROUP BY o.category")
    List<Object[]> countByCategoryGroupedFiltered(@Param("condominiumId") Long condominiumId, @Param("startDate") java.time.LocalDateTime startDate);
"""

content = re.sub(
    r'@Query\("SELECT o\.status, COUNT\(o\) FROM Occurrence o WHERE o\.condominium\.id = :condominiumId GROUP BY o\.status"\)\s+List<Object\[\]> countByStatusGrouped\(@Param\("condominiumId"\) Long condominiumId\);\s+@Query\("SELECT o\.category, COUNT\(o\) FROM Occurrence o WHERE o\.condominium\.id = :condominiumId GROUP BY o\.category"\)\s+List<Object\[\]> countByCategoryGrouped\(@Param\("condominiumId"\) Long condominiumId\);',
    new_queries.strip(),
    content,
    flags=re.DOTALL
)

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/repository/OccurrenceRepository.java", "w") as f:
    f.write(content)
