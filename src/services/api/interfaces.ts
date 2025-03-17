
// Interfaces for the Solana validator API

export interface ValidatorI {
    identity: string;
    vote_identity: string;
    last_vote: number;
    root_slot: number;
    credits: number;
    epoch_credits: number;
    activated_stake: number;
    version: string;
    delinquent: boolean;
    skip_rate: number;
    created_at: string;
    updated_at: string;
    oldest_active_stake_pubkey: string;
    first_epoch_with_stake: number;
    name: string;
    keybase: string;
    description: string;
    info_pubkey: string;
    website: string;
    commission: number;
    image: string;
    gossip_ip: string;
    mod: boolean;
    is_jito: boolean;
    jito_commission_bps?: number;
    admin_comment: string|null;
    ip_latitude: string;
    ip_longitude: string;
    ip_city: string;
    ip_country: string;
    ip_asn: string;
    ip_org: string;
    withdraw_authority: string;
    wiz_score_id: number;
    ignore: boolean;
    vote_success: number;
    vote_success_score: number;
    skip_rate_score: number;
    info_score: number;
    commission_score: number;
    first_epoch_distance: number;
    epoch_distance_score: number;
    stake_weight: number;
    above_halt_line: boolean;
    stake_weight_score: number;
    withdraw_authority_score: number;
    asn: string;
    asn_concentration: number;
    asn_concentration_score: number;
    tpu_ip: string;
    tpu_ip_concentration: number;
    tpu_ip_concentration_score: number;
    uptime: number;
    uptime_score: number;
    wiz_score: number;
    version_valid: boolean;
    city_concentration: number;
    city_concentration_score: number;
    invalid_version_score: number;
    superminority_penalty: number;
    score_version: number;
    no_voting_override: boolean;
    epoch: number;
    epoch_slot_height: number;
    asncity_concentration: number;
    asncity_concentration_score: number;
    stake_ratio: number;
    credit_ratio: number;
    apy_estimate: number;
    rank: number;
    updateTitle?: Function;
    userPubkey?: string;
    solflareEnabled?: boolean;
    skip_rate_ignored?: boolean;
    staking_apy?: number;
    jito_apy?: number;
    total_apy?: number;
}

export interface ClusterStatsI {
    avg_credit_ratio: number;
    avg_activated_stake: number;
    avg_commission: number;
    avg_skip_rate: number;
    avg_apy: number;
}

export interface EpochInfoI {
    epoch: number;
    duration_seconds: number;
    epochs_per_year: number;
    slot_height: number;
    start_slot: number;
    start_time: string;
    remaining_seconds: number;
    elapsed_seconds: number;
}

// DO NOT add duplicate export declarations - these are already exported above
