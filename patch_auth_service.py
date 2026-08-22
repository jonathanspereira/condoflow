import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/auth/service/AuthService.java", "r") as f:
    content = f.read()

first_access_code = """
    public void firstAccess(String email) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("E-mail é obrigatório");
        }
        String cleanEmail = email.trim();
        User user = (User) userRepository.findByEmail(cleanEmail);
        if (user == null) {
            user = (User) userRepository.findByEmail(cleanEmail.toLowerCase());
        }
        if (user == null) {
            throw new BusinessException("Se o e-mail estiver cadastrado, um link será enviado.");
        }

        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusHours(24));
        passwordResetTokenRepository.save(resetToken);

        emailService.sendFirstAccessEmail(user.getEmail(), user.getName(), token);
    }

    public void resetPassword(String token, String newPassword) {
"""

content = content.replace("    public void resetPassword(String token, String newPassword) {", first_access_code)

with open("backend/src/main/java/com/jonathanspereira/condoflow/auth/service/AuthService.java", "w") as f:
    f.write(content)
