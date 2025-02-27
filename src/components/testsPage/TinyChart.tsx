import React from 'react';
import { AverageEffortByVersion } from '../../pages/testsPage/types.tests';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TinyChartProps {
    averageReviewEffortScale: AverageEffortByVersion | 0;
}

export const TinyChart: React.FC<TinyChartProps> = ({ averageReviewEffortScale }) => {
    const chartData = Object.entries(averageReviewEffortScale).map(([versionId, data]) => ({
        versionId: Number(versionId),
        name: `${data.title} (ID ${versionId})`,
        ...data
    }));

    return (
        <>
            <ResponsiveContainer width="50%" height={400}>
                <BarChart data={chartData}>
                    <CartesianGrid
                        verticalPoints={[1, 2, 3, 4, 5]}
                        stroke="#ccc"
                        strokeDasharray="3 3"
                        vertical={false}
                    />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} tickCount={6} />
                    <Tooltip />
                    <Bar dataKey="averageEffort" name="Bewertung" fill="lightseagreen" />
                </BarChart>
            </ResponsiveContainer>
        </>
    );
};
