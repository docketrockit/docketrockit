const maskEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;

    if (localPart.length <= 2) {
        return `${localPart[0]}***@${domain}`;
    }

    const maskedLocal =
        localPart[0] +
        '*'.repeat(Math.max(localPart.length - 2, 1)) +
        localPart[localPart.length - 1];
    return `${maskedLocal}@${domain}`;
};

export default maskEmail;
