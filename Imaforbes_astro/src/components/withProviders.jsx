import React from 'react';
import { MotionConfig } from 'framer-motion';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext.jsx';
import '../i18n.js';

function LanguageAwareConsumer({ Component, componentProps }) {
  const { language } = useSettings();
  return <Component {...componentProps} data-lang={language} />;
}

export default function withProviders(Component) {
  return function WrappedComponent(props) {
    return (
      <SettingsProvider>
        <MotionConfig reducedMotion="user">
          <LanguageAwareConsumer Component={Component} componentProps={props} />
        </MotionConfig>
      </SettingsProvider>
    );
  };
}
