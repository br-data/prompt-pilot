export const isTestEnabled = () => {
    return process.env.STAGE === 'dev';
};