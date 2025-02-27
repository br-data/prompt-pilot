import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Tests } from './pages/testsPage/Tests';
import { Wrapper } from './styles.content';
import { SourcesOverview } from './pages/sourcesPage/SourcesOverview';
import { PromptsOverview } from './pages/promptPage/PromptsOverview';
import { SourcePage } from './pages/sourcesPage/SourcePage';
import { AnnotationView } from './pages/annotation/AnnotationView';
import { UserAdministration } from './pages/admin/userAdministration/UserAdministration';
import { TestDetails } from './pages/testsPage/TestDetails';

export const AppContent: React.FC = () => {
    return (
        <>
            <Wrapper>
                <Routes>
                    <Route path="/" element={<Tests />} />
                    <Route path="sources-overview" element={<SourcesOverview />} />
                    <Route path="prompts-overview" element={<PromptsOverview />} />
                    <Route path="sources-edit" element={<SourcePage />} />
                    <Route path="annotation" element={<AnnotationView />} />
                    <Route path="admin" element={<UserAdministration />} />
                    <Route path="test-details" element={<TestDetails />} />
                </Routes>
            </Wrapper>
        </>
    );
};
