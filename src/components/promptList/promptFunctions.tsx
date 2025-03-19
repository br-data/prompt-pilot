import { FormInstance } from 'antd';
import { getBaseUrl } from '../../utils/getBaseUrl';

export const submitForm = async (
    form: FormInstance,
    setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>,
    promptId?: string,
    closeModal?: () => void,
) => {
    const baseUrl = getBaseUrl();
    await form
        .validateFields()
        .then((values) => {
            const { variance, public: publicAvailable } = values;
            const varianceInt = Math.round(variance * 10);

            const payload = {
                ...values,
                variance: varianceInt,
                ...(promptId && { promptId }),
            };

            fetch(baseUrl + '/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Fehler beim Erstellen des Prompts');
                    }
                    return response.json();
                })
                .catch((error) => {
                    console.error('Fehler:', error);
                })
                .finally(() => {
                    setRefreshTrigger((prev) => prev + 1);
                });
        })
        .catch((info) => {
            console.log('Validation failed:', info);
        })
        .finally(() => {
            closeModal && closeModal();
        });
};
