import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/dashboard/controller/DashboardController.java", "r") as f:
    content = f.read()

new_syndic = """
    @GetMapping("/syndic")
    public ResponseEntity<SyndicDashboardDTO> getSyndicDashboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer days) {
        return ResponseEntity.ok(dashboardService.getSyndicDashboard(userDetails.getUsername(), days));
    }
"""

content = re.sub(
    r'@GetMapping\("/syndic"\)\s+public ResponseEntity<SyndicDashboardDTO> getSyndicDashboard\(\s*@AuthenticationPrincipal UserDetails userDetails\s*\) \{\s+return ResponseEntity\.ok\(dashboardService\.getSyndicDashboard\(userDetails\.getUsername\(\)\)\);\s+\}',
    new_syndic.strip(),
    content,
    flags=re.DOTALL
)

with open("backend/src/main/java/com/jonathanspereira/condoflow/dashboard/controller/DashboardController.java", "w") as f:
    f.write(content)
