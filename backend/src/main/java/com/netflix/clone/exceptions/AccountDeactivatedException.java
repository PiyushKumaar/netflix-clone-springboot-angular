package com.netflix.clone.exceptions;

public class AccountDeactivatedException extends RuntimeException{
    public AccountDeactivatedException(String message){
        super(message);
    }
}
