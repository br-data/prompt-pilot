import React from 'react';
import { Button, Result } from 'antd';


export const NoAdminWarning: React.FC = () => (

<Result
status="warning"
title="Bitte wende dich an eine:n Administator:in, um diese Seite zu sehen."
extra={
    <Button type="primary" href="/">
      Zurück zur Startseite
    </Button>
  }
/>
);