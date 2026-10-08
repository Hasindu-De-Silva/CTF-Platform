/*
 * HexaTech Core Grid Sabotage Countdown Tool
 * Author: Marcus Vance (MV-4092)
 * Target: aegis-core Emergency Controller
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

static const unsigned char VERIFICATION_TABLE[21] = {
    0x1B, 0x22, 0x23, 0x1C, 0x15, 0x86, 0x24, 0x30, 0x2E, 0x29, 0x95, 0x89, 0x8E, 0x8F, 0x96, 0xA4, 0x45, 0x4A, 0x55, 0x56, 0x57
};

/* Obfuscated flag ciphertext (28 bytes) - decoded only upon successful phrase validation */
static const unsigned char ENC_FLAG[28] = {
    0x08, 0x1F, 0x0D, 0x30, 0x39, 0x78, 0x3D, 0x78, 0x39, 0x38, 0x78, 0x14, 0x78, 0x25, 0x2C, 0x7A, 0x25, 0x78, 0x78, 0x39, 0x14, 0x26, 0x7F, 0x38, 0x3F, 0x78, 0x39, 0x36
};

int verify_phrase(const char *input) {
    size_t len = strlen(input);
    if (len != 21) {
        return 0;
    }
    for (size_t i = 0; i < len; i++) {
        unsigned char transformed = (unsigned char)(((unsigned char)input[i] ^ 0x5A) + (i * 3));
        if (transformed != VERIFICATION_TABLE[i]) {
            return 0;
        }
    }
    return 1;
}

int main(int argc, char *argv[]) {
    char buffer[128];
    printf("=====================================================\n");
    printf("HEXATECH SABOTAGE PROTOCOL // EMERGENCY HALT CONSOLE\n");
    printf("Binary: countdown.elf (v4.09-stripped)\n");
    printf("=====================================================\n\n");

    if (argc > 1) {
        strncpy(buffer, argv[1], sizeof(buffer) - 1);
        buffer[sizeof(buffer) - 1] = '\0';
    } else {
        printf("Enter Sabotage Authorization Override Phrase: ");
        if (!fgets(buffer, sizeof(buffer), stdin)) {
            return 1;
        }
        buffer[strcspn(buffer, "\r\n")] = '\0';
    }

    if (verify_phrase(buffer)) {
        char flag_buf[29];
        for (int i = 0; i < 28; i++) {
            flag_buf[i] = (char)(ENC_FLAG[i] ^ 0x4B);
        }
        flag_buf[28] = '\0';

        printf("\n[+] VERIFICATION SUCCESSFUL!\n");
        printf("[+] Sabotage countdown halted successfully!\n");
        printf("[+] Stage 7 Flag: %s\n", flag_buf);
        printf("[+] Authorized Mainframe Halt Phrase: %s\n", buffer);
        printf("[!] Use this authorization phrase in Stage 8 (/opt/halt_console) to disarm aegis-core.\n");
        return 0;
    } else {
        printf("\n[-] ACCESS DENIED! Invalid authorization phrase.\n");
        printf("[-] The core grid sabotage protocol continues counting down.\n");
        return 1;
    }
}
