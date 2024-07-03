/**
 * Change url to access the network
 * https://testnet.toncenter.com/api/v2/jsonRPC — testnet
 * https://toncenter.com/api/v2/jsonRPC — mainnet
 *
 */
export const TEST_NETWORK = true;
export const NETWORK = TEST_NETWORK
  ? "https://testnet.toncenter.com/api/v2/jsonRPC"
  : "https://toncenter.com/api/v2/jsonRPC";

export const EXPLORER_URL = TEST_NETWORK
  ? "https://testnet.tonscan.org"
  : "https://tonscan.org";
/**
 * Create your API_KEY in your Telegram account:
 * @tontestnetapibot — for testnet
 * @tonapibot — for mainnet
 *
 */
export const API_KEY = "YOUR_TON_API_KEY";
