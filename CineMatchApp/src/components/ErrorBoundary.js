import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught app error:', error);
    console.error('Component stack:', errorInfo?.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>CineMatch detectó un error</Text>
          <Text style={styles.subtitle}>
            La aplicación no se cerrará silenciosamente mientras este error esté activo.
          </Text>

          <Text style={styles.sectionTitle}>Mensaje</Text>
          <Text style={styles.codeBlock} selectable>
            {String(this.state.error?.message || this.state.error || 'Error desconocido')}
          </Text>

          <Text style={styles.sectionTitle}>Stack</Text>
          <Text style={styles.codeBlock} selectable>
            {String(this.state.error?.stack || 'Sin stack disponible')}
          </Text>

          <Text style={styles.sectionTitle}>Componente</Text>
          <Text style={styles.codeBlock} selectable>
            {String(this.state.errorInfo?.componentStack || 'Sin componente disponible')}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  content: {
    padding: 20,
    paddingTop: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#c7cbd6',
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f3f4f6',
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  codeBlock: {
    backgroundColor: '#171a21',
    color: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    fontSize: 13,
    lineHeight: 19,
  },
});

export default ErrorBoundary;