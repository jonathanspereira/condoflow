import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/unit/service/UnitService.java", "r") as f:
    content = f.read()

new_salvar = """
    public Unit salvar(Long condominiumId, UnitRequestDTO dto) {
        Optional<Unit> existing = buscarPorCondominioEUnidade(condominiumId, dto.getUnit());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("A unidade " + dto.getUnit() + " já possui cadastro neste condomínio.");
        }

        User owner = resolveOrCreateUser(dto.getOwnerName(), dto.getOwnerEmail(), Role.PROPRIETARY, condominiumId);
"""

content = re.sub(
    r'public Unit salvar\(Long condominiumId, UnitRequestDTO dto\) \{\s+User owner = resolveOrCreateUser\(dto\.getOwnerName\(\), dto\.getOwnerEmail\(\), Role\.PROPRIETARY, condominiumId\);',
    new_salvar.strip(),
    content
)

with open("backend/src/main/java/com/jonathanspereira/condoflow/unit/service/UnitService.java", "w") as f:
    f.write(content)
