import { isTestEnabled } from "./isTestEnabled";

export const getBaseUrl = () => {
    if (isTestEnabled()) {
        return 'http://localhost:3003';
    }
    return '';
};