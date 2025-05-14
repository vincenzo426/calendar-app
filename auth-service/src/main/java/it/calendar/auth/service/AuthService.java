package it.calendar.auth.service;

import io.smallrye.jwt.build.Jwt;
import it.calendar.auth.model.User;
import it.calendar.auth.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.mindrot.jbcrypt.BCrypt;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;

@ApplicationScoped
public class AuthService {
    
    private static final Logger LOG = Logger.getLogger(AuthService.class);
    
    @Inject
    UserRepository userRepository;
    
    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String issuer;
    
    @Transactional
    public User register(String username, String email, String password) {
        // Verifica se l'utente o l'email esistono già
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        LOG.debug("Registering new user: " + username);
        
        // Hash della password
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        
        // Creazione e salvataggio del nuovo utente
        User user = new User(username, email, hashedPassword);
        userRepository.persist(user);
        
        LOG.debug("User registered successfully with ID: " + user.id);
        return user;
    }
    
    public Optional<String> authenticate(String username, String password) {
        LOG.debug("Authentication attempt for user: " + username);
        
        User user = userRepository.findByUsername(username);
        
        if (user != null && BCrypt.checkpw(password, user.password)) {
            LOG.debug("Authentication successful for user: " + username);
            return Optional.of(generateToken(user));
        }
        
        LOG.debug("Authentication failed for user: " + username);
        return Optional.empty();
    }
    
    private String generateToken(User user) {
        LOG.debug("Generating JWT token for user ID: " + user.id);
        
        // Assicuriamoci che userId sia una stringa (per evitare problemi di tipo)
        String userIdStr = user.id.toString();
        
        try {
            String token = Jwt.issuer(issuer)
                    .subject(userIdStr)  // Usa l'ID utente come subject
                    .groups(new HashSet<>(Arrays.asList("user")))
                    .claim("email", user.email)
                    .claim("username", user.username)
                    .claim("userId", userIdStr)  // Aggiungi l'ID utente anche come claim esplicito
                    .expiresAt(Instant.now().plus(Duration.ofHours(24)))
                    .sign();
            
            LOG.debug("Token generated successfully");
            return token;
        } catch (Exception e) {
            LOG.error("Error generating JWT token", e);
            throw e;
        }
    }
}