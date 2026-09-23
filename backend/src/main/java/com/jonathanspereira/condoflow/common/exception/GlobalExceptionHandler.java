package com.jonathanspereira.condoflow.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MethodArgumentNotValidException;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(org.springframework.dao.DataIntegrityViolationException ex) {
        String message = "Não é possível excluir este registro pois ele está vinculado a outras informações no sistema (ex: encomendas, ocorrências, etc).";
        ErrorResponse errorResponse = new ErrorResponse(message, HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        String message = "Dados inválidos ou incompletos foram enviados. Verifique os campos do formulário (ex: categoria vazia).";
        ErrorResponse errorResponse = new ErrorResponse(message, HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        
        ErrorResponse errorResponse = new ErrorResponse(errorMessage, HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        String reason = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        ErrorResponse errorResponse = new ErrorResponse(reason, ex.getStatusCode().value());
        return new ResponseEntity<>(errorResponse, ex.getStatusCode());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Erro no sistema | Rota: {} {} | O que o usuário tentava fazer: Acessar a URL acima | Detalhes: {}", 
                  request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);
                  
        // Temporarily exposing stack trace/error message for debugging
        ErrorResponse errorResponse = new ErrorResponse("Erro 500: " + ex.getClass().getSimpleName() + " - " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
