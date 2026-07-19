import React from 'react';
import { SettingsProvider } from '../contexts/SettingsContext.jsx';
import '../i18n.js';

export default function withProviders(Component) {
  return function WrappedComponent(props) {
    return (
      <SettingsProvider>
        <Component {...props} />
      </SettingsProvider>
    );
  };
}
