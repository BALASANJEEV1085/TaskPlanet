# Secure Sharing System Documentation

## Overview
TaskPlanet now features an enterprise-grade secure sharing system with token-based authentication, expiration controls, and access tracking.

## 🔒 Security Features

### 1. **Token-Based Sharing**
- **Cryptographically Secure Tokens**: 64-character hexadecimal tokens generated using `crypto.randomBytes(32)`
- **Unique & Non-Guessable**: Each share link uses a unique token that cannot be predicted
- **Database-Backed**: All tokens stored in MongoDB with full audit trail

### 2. **Access Controls**
- **Expiration Dates**: Set custom expiration (1, 7, 30, or 90 days)
- **Access Limits**: Optional maximum view count before link becomes invalid
- **Manual Revocation**: Users can revoke share links at any time
- **Auto-Expiration**: MongoDB TTL index automatically deletes expired tokens

### 3. **Audit Trail**
- **Access Tracking**: Counts every access to shared content
- **IP Logging**: Records IP addresses of all viewers
- **User Agent Tracking**: Logs browser/device information
- **Timestamp Logging**: Automatic creation and access timestamps

### 4. **Resource Protection**
- **Ownership Verification**: Only resource owners can create share links
- **Permission Checks**: Backend validates user permissions before creating tokens
- **Resource Validation**: Ensures shared posts/profiles exist before creating links

## 📋 API Endpoints

### Create Share Token
```
POST /api/share/create
Authorization: Bearer <token>

Body:
{
  "resourceType": "post" | "user",
  "resourceId": "MongoDB ObjectId",
  "expiresInDays": 30,
  "maxAccess": 100 (optional)
}

Response:
{
  "success": true,
  "shareUrl": "http://localhost:5173/share/abc123...",
  "token": "abc123...",
  "expiresAt": "2026-03-10T...",
  "maxAccess": 100
}
```

### Access Shared Content
```
GET /api/share/:token

Response (Post):
{
  "type": "post",
  "data": { ...post data },
  "accessCount": 5,
  "expiresAt": "2026-03-10T..."
}

Response (User):
{
  "type": "user",
  "data": {
    "user": { ...user data },
    "posts": [ ...recent posts ]
  },
  "accessCount": 12,
  "expiresAt": "2026-03-10T..."
}
```

### Revoke Share Token
```
DELETE /api/share/:token
Authorization: Bearer <token>

Response:
{
  "msg": "Share link revoked successfully"
}
```

### Get My Shares
```
GET /api/share/user/my-shares
Authorization: Bearer <token>

Response: Array of share tokens with metadata
```

## 🎨 User Interface

### Share Dialog Features
1. **Expiration Selector**: Dropdown with preset durations (1, 7, 30, 90 days)
2. **Access Limit Input**: Optional field to limit total views
3. **QR Code Generation**: Automatic QR code for generated links
4. **Copy to Clipboard**: One-click copy functionality
5. **Visual Feedback**: Loading states and success messages

### Shared Content Page
- **Access Counter**: Shows how many times the link has been viewed
- **Expiration Warning**: Displays time until link expires
- **Security Badge**: Visual indicator that it's a secure link
- **Full Content Display**: Posts or user profiles with recent activity

## 🔐 Security Benefits

### Compared to Direct Links
| Feature | Direct Links | Secure Tokens |
|---------|-------------|---------------|
| Revocable | ❌ No | ✅ Yes |
| Expiration | ❌ No | ✅ Yes |
| Access Tracking | ❌ No | ✅ Yes |
| Access Limits | ❌ No | ✅ Yes |
| Audit Trail | ❌ No | ✅ Yes |
| Non-Guessable | ❌ No | ✅ Yes |

### Protection Against
- ✅ **Unauthorized Access**: Tokens can be revoked instantly
- ✅ **Link Scraping**: Access limits prevent mass harvesting
- ✅ **Permanent Exposure**: Automatic expiration limits exposure window
- ✅ **Tracking Evasion**: IP and user agent logging for security monitoring
- ✅ **Brute Force**: 64-character hex tokens = 2^256 possibilities

## 📊 Database Schema

```javascript
{
  token: String (unique, indexed),
  resourceType: "post" | "user",
  resourceId: ObjectId,
  createdBy: ObjectId (ref: User),
  expiresAt: Date (TTL indexed),
  accessCount: Number,
  maxAccess: Number (nullable),
  isActive: Boolean,
  metadata: {
    ipAddresses: [String],
    userAgents: [String]
  },
  timestamps: true
}
```

## 🚀 Usage Examples

### Sharing a Post
1. Click share button on any post
2. Select expiration period (default: 30 days)
3. Optionally set max access count
4. Click "Generate Link"
5. Copy the secure URL or scan QR code
6. Share with intended recipients

### Sharing a Profile
1. Navigate to your profile
2. Click share button
3. Configure expiration and access limits
4. Generate secure link
5. Share via QR code or copy link

### Viewing Shared Content
1. Recipient clicks/scans shared link
2. Redirected to `/share/:token` route
3. Content displayed with access info
4. Access counter increments
5. Audit trail updated

## 🛡️ Best Practices

### For Users
- Use shorter expiration for sensitive content
- Set access limits for private shares
- Revoke links when no longer needed
- Monitor access counts for suspicious activity

### For Administrators
- Regularly audit share token database
- Monitor for unusual access patterns
- Set up alerts for high-access tokens
- Implement rate limiting on share creation

## 🔧 Configuration

### Environment Variables
```
FRONTEND_URL=http://localhost:5173
```

### Rate Limiting
- Share creation: Inherits from general API rate limit (100/10min)
- Share access: No limit (public endpoint)

## 📈 Future Enhancements

- [ ] Password-protected shares
- [ ] Email-gated access
- [ ] Analytics dashboard for share performance
- [ ] Bulk share management
- [ ] Share link templates
- [ ] Geographic access restrictions
- [ ] Time-window access (specific hours/days)
- [ ] Watermarking for shared content

## 🎯 Compliance

This secure sharing system helps meet:
- **GDPR**: User control over data sharing
- **CCPA**: Transparent data access tracking
- **SOC 2**: Audit trail and access controls
- **ISO 27001**: Information security management

---

**Implementation Date**: February 8, 2026
**Version**: 1.0
**Status**: Production Ready ✅
