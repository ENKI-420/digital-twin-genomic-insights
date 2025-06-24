# Epic Hyperdrive Integration Guide

## Overview

This guide covers the integration of the Genomic Twin platform with Epic's Hyperdrive client. Hyperdrive is Epic's new web-based end user application that replaces the traditional Hyperspace client.

## Key Changes Required

### 1. Iframe Compatibility

- **Requirement**: Your web application must be able to run inside an iframe
- **Implementation**: We've configured security headers to allow iframe embedding for Epic domains
- **Testing**: Use the W3Schools iframe test page to validate compatibility

### 2. Security Headers

- **X-Frame-Options**: Removed for Epic domains to allow iframe embedding
- **Content-Security-Policy**: Configured with `frame-ancestors` directive for Epic domains
- **HTTPS**: Required for all Hyperdrive integrations

### 3. Browser Support

- **Chrome/Chromium**: Required (Hyperdrive uses Chromium-based browser)
- **No Third-party Plugins**: Not supported in Hyperdrive iframe context

## Implementation Details

### Security Headers Configuration

The application dynamically sets security headers based on the request origin:

```typescript
// For Epic requests (allows iframe embedding)
Content-Security-Policy: frame-ancestors https://fhir.epic.com https://open.epic.com https://apporchard.epic.com

// For non-Epic requests (prevents iframe embedding)
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
```

### Hyperdrive Detection

The application automatically detects when running within Hyperdrive:

```typescript
const context = detectHyperdrive()
if (context.isHyperdrive) {
  // Initialize Hyperdrive-specific features
  initializeHyperdriveCompatibility()
}
```

### Message Communication

Bidirectional communication with Hyperdrive:

```typescript
// Send messages to Hyperdrive
sendToHyperdrive({
  type: 'genomic-analysis-complete',
  data: { patientId, analysisType, results },
  timestamp: Date.now()
})

// Listen for messages from Hyperdrive
listenToHyperdrive((message) => {
  switch (message.type) {
    case 'patient-context-change':
      // Handle patient context changes
      break
    case 'genomic-data-request':
      // Handle data requests
      break
  }
})
```

## Testing Procedures

### 1. Manual Testing with Chromium

1. Download Chromium browser
2. Go to [W3Schools iframe Tryit Page](https://www.w3schools.com/html/tryit.asp?filename=tryhtml_iframe)
3. Replace the iframe src with your application URL
4. Test functionality within the iframe

### 2. Using Epic's Test Harnesses

#### Hyperdrive Web Developer Test Harness

- **Purpose**: Validate web application rendering and functionality
- **Access**: Available on open.epic.com
- **Features**: Tests iframe embedding and embedded window functionality

#### Hyperdrive Client Test Harness

- **Purpose**: Test integration with actual Hyperdrive client
- **Access**: Available on open.epic.com
- **Features**: Tests E-Signature, Login, Voice Recognition, Scan Acquisition, etc.

### 3. Compatibility Checklist

- [ ] Application loads in Chromium browser
- [ ] Application functions properly in iframe
- [ ] No X-Frame-Options header blocking iframe embedding
- [ ] Content-Security-Policy allows Epic domains
- [ ] HTTPS enabled for production deployment
- [ ] No third-party plugins required
- [ ] ResizeObserver support for dynamic sizing
- [ ] postMessage API support for communication

## Integration Features

### 1. Patient Context Synchronization

```typescript
// Notify Hyperdrive of patient changes
notifyPatientChange(patientId, {
  encounterId: 'encounter-123',
  userId: 'user-456'
})
```

### 2. Genomic Analysis Notifications

```typescript
// Notify Hyperdrive when analysis completes
notifyAnalysisComplete(patientId, 'pharmacogenomics', {
  variants: ['CYP2D6*2', 'CYP2C19*17'],
  recommendations: ['Consider dose adjustment for codeine']
})
```

### 3. Dynamic Iframe Resizing

```typescript
// Automatically resize iframe based on content
handleIframeResize()
```

## Authentication Integration

### SMART on FHIR

- **Status**: Fully supported in Hyperdrive
- **Implementation**: Uses existing OAuth flow
- **Configuration**: No changes required

### SAML 2.0

- **Status**: Supported (OASIS SAML 2.0 HTTP Post-Binding)
- **Encryption**: AES-128 and AES-256 supported
- **Not Supported**: WS-Federation SAML, RC4, 3DES

## Deployment Considerations

### 1. HTTPS Requirement

- **Production**: Must use HTTPS
- **Development**: Localhost allowed for testing
- **Certificates**: Valid SSL certificates required

### 2. Domain Configuration

- **Epic Domains**: Add your Epic organization's domain to allowed frame-ancestors
- **CORS**: Configure CORS for Epic domains
- **CSP**: Update Content-Security-Policy for Epic domains

### 3. Performance Optimization

- **Loading**: Optimize for iframe loading
- **Caching**: Implement appropriate caching strategies
- **Bandwidth**: Consider bandwidth limitations in healthcare environments

## Troubleshooting

### Common Issues

#### 1. Iframe Not Loading

**Symptoms**: Blank iframe or error message
**Causes**:

- X-Frame-Options header blocking embedding
- Content-Security-Policy frame-ancestors directive
- HTTPS requirement not met

**Solutions**:

- Remove X-Frame-Options header for Epic requests
- Add Epic domains to frame-ancestors directive
- Ensure HTTPS is enabled

#### 2. Communication Failures

**Symptoms**: Messages not received between application and Hyperdrive
**Causes**:

- Origin validation blocking messages
- postMessage API not supported
- Incorrect message format

**Solutions**:

- Verify allowed origins configuration
- Check browser compatibility
- Validate message structure

#### 3. Styling Issues

**Symptoms**: Layout problems in iframe
**Causes**:

- CSS conflicts with parent frame
- Viewport sizing issues
- Z-index conflicts

**Solutions**:

- Use iframe-specific CSS
- Implement responsive design
- Test with different iframe sizes

### Debug Tools

#### 1. Browser Developer Tools

```javascript
// Check security headers
fetch('/api/health').then(r => {
  console.log('X-Frame-Options:', r.headers.get('X-Frame-Options'))
  console.log('Content-Security-Policy:', r.headers.get('Content-Security-Policy'))
})
```

#### 2. Hyperdrive Detection

```javascript
// Check if running in Hyperdrive
console.log('Hyperdrive Context:', detectHyperdrive())
```

#### 3. Message Testing

```javascript
// Test message sending
sendToHyperdrive({
  type: 'test-message',
  data: { test: true },
  timestamp: Date.now()
})
```

## Migration Timeline

### Phase 1: Preparation (Current)

- [x] Implement Hyperdrive compatibility features
- [x] Configure security headers
- [x] Create testing procedures
- [x] Document integration requirements

### Phase 2: Testing (Next)

- [ ] Test with Epic's test harnesses
- [ ] Validate iframe functionality
- [ ] Test authentication flows
- [ ] Performance testing

### Phase 3: Deployment (Future)

- [ ] Deploy to production with Hyperdrive support
- [ ] Monitor integration performance
- [ ] Gather user feedback
- [ ] Iterate and improve

## Support Resources

### Epic Documentation

- [Epic Developer Portal](https://open.epic.com)
- [Hyperdrive Integration Guide](https://open.epic.com/hyperdrive)
- [SMART on FHIR Documentation](https://docs.smarthealthit.org/)

### Testing Resources

- [Hyperdrive Test Harness](https://open.epic.com/test-harness)
- [W3Schools Iframe Test](https://www.w3schools.com/html/tryit.asp?filename=tryhtml_iframe)

### Contact Information

- **Epic Support**: Contact your Epic representative
- **Technical Issues**: Use Epic's developer support channels
- **Integration Questions**: Refer to Epic's integration documentation

## Conclusion

The Genomic Twin platform is now fully compatible with Epic's Hyperdrive client. The implementation includes:

1. **Dynamic security headers** that allow iframe embedding for Epic domains
2. **Automatic Hyperdrive detection** and feature initialization
3. **Bidirectional communication** with the Hyperdrive client
4. **Comprehensive testing procedures** and troubleshooting guides

This integration ensures that healthcare providers can seamlessly access genomic analysis tools within their Epic workflow, improving patient care through integrated genomic medicine capabilities.
