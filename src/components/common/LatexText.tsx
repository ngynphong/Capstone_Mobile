import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface LatexTextProps {
  content: string;
  style?: object;
  textStyle?: object;
  fontSize?: number;
}

/**
 * Component để render text có chứa LaTeX
 * Hỗ trợ: $...$ (inline), $$...$$ (block), \[...\] (display), \(...\) (inline)
 */
const LatexText: React.FC<LatexTextProps> = ({
  content,
  style,
  textStyle,
  fontSize = 16
}) => {
  const [webViewHeight, setWebViewHeight] = useState(50);
  const { width } = useWindowDimensions();

  // Check if content contains LaTeX patterns
  const hasLatex = useMemo(() => {
    return /\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)/g.test(content);
  }, [content]);

  // Convert LaTeX delimiters to MathJax-compatible format
  // Must be called unconditionally to satisfy React hooks rules
  const processedContent = useMemo(() => {
    return content
      // Escape HTML entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Keep LaTeX delimiters as-is for MathJax
      .replace(/\n/g, '<br/>');
  }, [content]);

  // Generate HTML for WebView (must be called unconditionally)
  const html = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <script>
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
            displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
          },
          svg: {
            fontCache: 'global'
          },
          startup: {
            ready: () => {
              MathJax.startup.defaultReady();
              MathJax.startup.promise.then(() => {
                setTimeout(() => {
                  const height = document.documentElement.scrollHeight;
                  window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
                }, 100);
              });
            }
          }
        };
      </script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: ${fontSize}px;
          line-height: 1.6;
          color: #374151;
          padding: 4px 0;
          background-color: transparent;
        }
        mjx-container {
          overflow-x: auto;
          overflow-y: hidden;
        }
        mjx-container[display="true"] {
          display: block;
          text-align: center;
          margin: 8px 0;
        }
      </style>
    </head>
    <body>
      <div id="content">${processedContent}</div>
    </body>
    </html>
  `, [processedContent, fontSize]);

  // If no LaTeX, render as plain text  
  if (!hasLatex) {
    return <Text style={[styles.text, textStyle]}>{content}</Text>;
  }

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height) {
        setWebViewHeight(Math.max(data.height, 30));
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={[styles.webView, { height: webViewHeight, width: width - 80 }]}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  webView: {
    backgroundColor: 'transparent',
  },
});

export default LatexText;
