class AuthTokenResponse {
    constructor(userId, accessToken, hasBinding, hasPassword) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.hasBinding = hasBinding;
        this.hasPassword = hasPassword;
    }

    // Getters
    getUserId() {
        return this.userId;
    }

    getAccessToken() {
        return this.accessToken;
    }

    isHasBinding() {
        return this.hasBinding;
    }

    isHasPassword() {
        return this.hasPassword;
    }

    // Setters
    setUserId(value) {
        this.userId = value;
    }

    setAccessToken(value) {
        this.accessToken = value;
    }

    setHasBinding(value) {
        this.hasBinding = value;
    }

    setHasPassword(value) {
        this.hasPassword = value;
    }

    // Output as plain object (for API response)
    toJSON() {
        return {
            userId: this.userId,
            accessToken: this.accessToken,
            hasBinding: this.hasBinding,
            hasPassword: this.hasPassword
        };
    }
}

module.exports = AuthTokenResponse;
