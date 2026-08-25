package com.jonathanspereira.condoflow.common.security;

import com.jonathanspereira.condoflow.auth.service.TokenService;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRoleRepository;
import com.jonathanspereira.condoflow.unit.repository.UnitRepository;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.entity.Role;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UserRepository userRepository;
    private final CondominiumRoleRepository condominiumRoleRepository;
    private final UnitRepository unitRepository;

    public SecurityFilter(TokenService tokenService, UserRepository userRepository, CondominiumRoleRepository condominiumRoleRepository, UnitRepository unitRepository) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
        this.condominiumRoleRepository = condominiumRoleRepository;
        this.unitRepository = unitRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            Long tenantId = null;
            String tenantIdStr = request.getHeader("X-Tenant-ID");
            if (tenantIdStr != null && !tenantIdStr.isBlank()) {
                tenantId = Long.parseLong(tenantIdStr);
                com.jonathanspereira.condoflow.common.config.TenantContext.setCurrentTenant(tenantId);
            }

            var token = this.recoverToken(request);
            if (token != null) {
                var login = tokenService.validateToken(token);
                UserDetails userDetails = userRepository.findByEmail(login);

                if (userDetails != null) {
                    User user = (User) userDetails;
                    
                    // Validate tenant access
                    if (tenantId != null && user.getRole() != Role.SUPER_ADMIN) {
                        boolean hasRole = condominiumRoleRepository.findByCondominiumIdAndUserId(tenantId, user.getId()).isPresent();
                        boolean hasUnit = !unitRepository.findAllByOwnerId(user.getId()).isEmpty() || !unitRepository.findAllByTenantId(user.getId()).isEmpty();
                        
                        // We check if user is in this condominium via roles or units
                        if (!hasRole && !hasUnit) {
                            response.sendError(HttpServletResponse.SC_FORBIDDEN, "User does not have access to this condominium.");
                            return;
                        }
                    }

                    var authorities = user.getAuthorities();
                    var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
            filterChain.doFilter(request, response);
        } finally {
            com.jonathanspereira.condoflow.common.config.TenantContext.clear();
        }
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        return authHeader.replace("Bearer ", "");
    }
}
