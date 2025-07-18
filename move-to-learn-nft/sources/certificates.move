// address 0x113a5836d6b3168e72e7ababe340ad91518ae6609a0499b3e5648388f949f058 {
// address bca9ae447aca3ba892a096fbc18a15040ecc689c1ed56dcc4ee34299ddf52ad7 {
module move_to_learn_nft::certificates {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::timestamp;
    
    public struct Certificate has key, store, drop, copy {
        student: address,
        course_id: string::String,
        completion_date: u64,
        certificate_hash: vector<u8>,
        credits_earned: u64
    }

    public struct Credits has key {
        amount: u64
    }

    public struct CertificateStore has key {
        certificates: vector<Certificate>
    }

    // Initialize student records
    public entry fun initialize_student(account: &signer) {
        let student_addr = signer::address_of(account);
        
        if (!exists<Credits>(student_addr)) {
            move_to(account, Credits { amount: 0 });
        };
        
        if (!exists<CertificateStore>(student_addr)) {
            move_to(account, CertificateStore {
                certificates: vector::empty()
            });
        };
    }
    
    // Issue certificate and credits
    public entry fun issue_certificate(
        admin: &signer,
        student_addr: address,
        course_id: string::String,
        certificate_hash: vector<u8>,
        credits: u64
    ) acquires Credits, CertificateStore {
        // Verify admin privileges
        assert!(is_admin(signer::address_of(admin)), 1001);
        
        // Ensure student records are initialized
        assert!(exists<Credits>(student_addr) && exists<CertificateStore>(student_addr), 1002);
        
        // Get current timestamp
        let timestamp = timestamp::now_seconds();
        
        // Create new certificate
        let new_cert = Certificate {
            student: student_addr,
            course_id,
            completion_date: timestamp,
            certificate_hash,
            credits_earned: credits
        };
        
        // Update student records
        let cert_store = borrow_global_mut<CertificateStore>(student_addr);
        vector::push_back(&mut cert_store.certificates, new_cert);
        
        let student_credits = borrow_global_mut<Credits>(student_addr);
        student_credits.amount = student_credits.amount + credits;
    }
    
    #[view]
    public fun get_certificates(student_addr: address): vector<Certificate>
    acquires CertificateStore {
        assert!(exists<CertificateStore>(student_addr), 1002);
        *&borrow_global<CertificateStore>(student_addr).certificates
    }
    
    #[view]
    public fun get_total_credits(student_addr: address): u64 
    acquires Credits {
        assert!(exists<Credits>(student_addr), 1002);
        borrow_global<Credits>(student_addr).amount
    }
    
    // Admin check
    fun is_admin(addr: address): bool {
        // addr == @move_to_learn_nft
        addr == @default
    }
}
