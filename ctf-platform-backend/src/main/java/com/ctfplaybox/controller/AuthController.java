package com.ctfplaybox.controller;

import com.ctfplaybox.dto.AuthDtos.LoginRequest;
import com.ctfplaybox.dto.AuthDtos.RegisterRequest;
import com.ctfplaybox.dto.AuthDtos.UserResponse;
import com.ctfplaybox.model.User;
import com.ctfplaybox.repository.UserRepository;
import com.ctfplaybox.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final UserRepository userRepository;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authenticationManager, UserService userService, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            userService.registerPlayer(req.getUsername(), req.getPassword());
            return ResponseEntity.status(HttpStatus.CREATED).body("Registered successfully - you can now log in");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req,
                                    HttpServletRequest request,
                                    HttpServletResponse response) {
        Authentication authRequest =
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword());
        Authentication authResult;
        try {
            authResult = authenticationManager.authenticate(authRequest);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authResult);
        SecurityContextHolder.setContext(context);
        // Persist the security context into the HTTP session so it survives across requests
        securityContextRepository.saveContext(context, request, response);

        User user = userRepository.findByUsername(req.getUsername()).orElseThrow();
        return ResponseEntity.ok(new UserResponse(user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        request.getSession().invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logged out");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(new UserResponse(user.getUsername(), user.getRole().name()));
    }
}
