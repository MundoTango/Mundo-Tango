# n8n + Notion Integration Guide for Mundo Tango

**Purpose**: Connect n8n workflows with Notion databases for centralized documentation, task management, and knowledge base for Mr. Blue and the Mundo Tango team.

## Overview

This guide demonstrates how to integrate n8n with Notion to:
- **Document workflows and decisions** in Notion pages
- **Track tasks and projects** using Notion databases  
- **Store meeting notes** from Zoom/Slack interactions
- **Maintain people/contact database** for community management
- **Create automated documentation** from Mr. Blue's activities

## Prerequisites

✅ **Already Configured in Replit Secrets**:
- `NOTION_API_KEY` - Notion integration API key
- `NOTION_PEOPLE_DB_ID` - Database ID for people/contacts
- `NOTION_MEETINGS_DB_ID` - Database ID for meeting notes
- `NOTION_TASKS_DB_ID` - Database ID for tasks and projects

## Notion Setup

### 1. Create Notion Integration

Your Notion integration is already set up, but here's how it was created:

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it "Mundo Tango n8n"
4. Select your workspace
5. Copy the "Internal Integration Token" (this is your `NOTION_API_KEY`)

### 2. Share Databases with Integration

For each Notion database you want n8n to access:

1. Open the database in Notion
2. Click "..." (three dots) in top right
3. Click "Add connections"
4. Select "Mundo Tango n8n" integration
5. The integration now has access to read/write this database

### 3. Get Database IDs

To find a database ID:
1. Open the database as a full page
2. Look at the URL: `https://notion.so/workspace/<database_id>?v=...`
3. The database_id is the 32-character code before `?v=`
4. Example: `https://notion.so/abc123def456` → database_id = `abc123def456`

## n8n Workflows with Notion

### Workflow 1: Mr. Blue Activity Logger

**Purpose**: Automatically log Mr. Blue's actions and decisions to Notion.

**Trigger**: Slack webhook when Mr. Blue completes a task
**Actions**:
1. **Webhook node**: Receive Mr. Blue activity data
2. **Notion node**: Create page in "Mr. Blue Logs" database
   - **Operation**: Create database item
   - **Database ID**: Use your logging database ID
   - **Properties**:
     - Title: Activity name
     - Date: Current timestamp
     - Description: Activity details
     - Status: "Completed"

**Configuration**:
```javascript
// In Notion node
{
  "database_id": "{{$env.NOTION_TASKS_DB_ID}}",
  "properties": {
    "Name": {
      "title": [
        {
          "text": {
            "content": "{{$json.activityName}}"
          }
        }
      ]
    },
    "Date": {
      "date": {
        "start": "{{$now}}"
      }
    },
    "Description": {
      "rich_text": [
        {
          "text": {
            "content": "{{$json.details}}"
          }
        }
      ]
    }
  }
}
```

### Workflow 2: Meeting Notes Automation

**Purpose**: Save Zoom meeting transcripts to Notion.

**Trigger**: Zoom meeting ends
**Actions**:
1. **Zoom Trigger**: Meeting ended
2. **Get Meeting Details**: Fetch transcript
3. **Notion node**: Create page in Meetings database
   - **Database**: NOTION_MEETINGS_DB_ID
   - **Properties**:
     - Title: Meeting topic
     - Date: Meeting date
     - Participants: Attendee list
     - Transcript: Full transcript
     - Action Items: Extracted tasks

### Workflow 3: Task Creation from Slack

**Purpose**: Create Notion tasks when mentioned in Slack.

**Trigger**: Slack message mentioning "task:" or "@Mr. Blue"
**Actions**:
1. **Slack Trigger**: Message posted
2. **Parse message**: Extract task details
3. **Notion node**: Create task in Tasks database
   - **Database**: NOTION_TASKS_DB_ID
   - **Properties**:
     - Task Name: Extracted from message
     - Assigned To: Mentioned person
     - Status: "To Do"
     - Created By: Message author
     - Due Date: Parsed date (if mentioned)

### Workflow 4: People Database Sync

**Purpose**: Keep Notion people database synced with Slack/platform users.

**Trigger**: New user registers or profile updated
**Actions**:
1. **Webhook**: User data from Mundo Tango platform
2. **Notion node**: Check if person exists
   - **Operation**: Search database
   - **Database**: NOTION_PEOPLE_DB_ID
   - **Filter**: Email equals user email
3. **IF node**: Person exists?
   - **True**: Update existing entry
   - **False**: Create new entry
4. **Notion node**: Create/Update database item
   - **Properties**:
     - Name: User full name
     - Email: User email
     - Role: User role (Dancer, Organizer, etc.)
     - City: User location
     - Join Date: Registration date

### Workflow 5: Documentation Generator

**Purpose**: Auto-generate documentation pages from code changes.

**Trigger**: GitHub push to main branch
**Actions**:
1. **GitHub Trigger**: Push event
2. **Parse commits**: Extract commit messages
3. **AI node (OpenAI)**: Generate documentation summary
4. **Notion node**: Create/update documentation page
   - **Operation**: Create page
   - **Parent Page**: Documentation section
   - **Content**: AI-generated summary with code references

## Notion Node Configuration in n8n

### Basic Setup

1. In n8n workflow, add "Notion" node
2. Click "Create New Credential"
3. **API Key**: Enter your `NOTION_API_KEY` from Replit Secrets
4. Test connection
5. Save credential as "Mundo Tango Notion"

### Common Operations

#### Create Database Item
```json
{
  "resource": "database",
  "operation": "create",
  "databaseId": "{{$env.NOTION_TASKS_DB_ID}}",
  "properties": {
    "Name": {
      "title": [{"text": {"content": "Task Name"}}]
    }
  }
}
```

#### Update Database Item
```json
{
  "resource": "database",
  "operation": "update",
  "pageId": "{{$json.page_id}}",
  "properties": {
    "Status": {
      "select": {"name": "In Progress"}
    }
  }
}
```

#### Search Database
```json
{
  "resource": "database",
  "operation": "search",
  "databaseId": "{{$env.NOTION_PEOPLE_DB_ID}}",
  "filterType": "manual",
  "filters": {
    "property": "Email",
    "text": {
      "equals": "user@example.com"
    }
  }
}
```

#### Create Page
```json
{
  "resource": "page",
  "operation": "create",
  "parentId": "parent_page_id",
  "title": "New Documentation Page",
  "blocks": [
    {
      "type": "paragraph",
      "paragraph": {
        "rich_text": [{"text": {"content": "Page content here"}}]
      }
    }
  ]
}
```

## Notion Database Schema Examples

### Tasks Database

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Task name |
| Status | Select | To Do, In Progress, Done |
| Assigned To | Person | Team member |
| Due Date | Date | Deadline |
| Priority | Select | Low, Medium, High |
| Created By | Person | Creator |
| Related To | Relation | Link to People/Projects |

### People Database

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Full name |
| Email | Email | Contact email |
| Role | Multi-select | Dancer, Organizer, Teacher |
| City | Select | Location |
| Join Date | Date | Registration date |
| Status | Select | Active, Inactive |
| Notes | Rich Text | Additional info |

### Meetings Database

| Property | Type | Description |
|----------|------|-------------|
| Title | Title | Meeting name |
| Date | Date | Meeting date/time |
| Participants | Multi-select | Attendees |
| Type | Select | Team, Client, Planning |
| Transcript | Rich Text | Full transcript |
| Action Items | Relation | Link to Tasks |
| Recording URL | URL | Zoom recording link |

## Integration with Mr. Blue

### Coordination Protocol

Following `mb.md` methodology, Mr. Blue coordinates with Notion through n8n:

1. **Observe**: Mr. Blue monitors Slack/platform activities
2. **Orient**: Determines if documentation needed
3. **Decide**: Triggers n8n workflow via webhook
4. **Act**: n8n creates/updates Notion entries
5. **Verify**: Mr. Blue confirms documentation created
6. **Learn**: Logs outcome for future improvements

### Example: Task Creation Flow

```
User in Slack: "@Mr. Blue create task: Update event scraper for Buenos Aires"
↓
Mr. Blue processes request (mb.md Step 1-3)
↓
Mr. Blue triggers n8n webhook:
POST https://boddye.app.n8n.cloud/webhook/create-task
{
  "taskName": "Update event scraper for Buenos Aires",
  "requestedBy": "user_id",
  "priority": "High",
  "context": "Slack message link"
}
↓
n8n workflow:
1. Receives webhook
2. Creates Notion task in NOTION_TASKS_DB_ID
3. Returns task URL
↓
Mr. Blue confirms to user:
"✅ Task created in Notion: [Task URL]"
↓
Mr. Blue logs action (mb.md Step 6)
```

## Environment Variables Reference

Already configured in **Replit Secrets**:

```bash
# Notion API
NOTION_API_KEY=secret_xxx  # Notion integration token

# Notion Databases
NOTION_PEOPLE_DB_ID=abc123  # People/contacts database
NOTION_MEETINGS_DB_ID=def456  # Meeting notes database
NOTION_TASKS_DB_ID=ghi789  # Tasks/projects database
```

## Testing the Integration

### Test 1: Create a Notion Page via n8n

1. Go to n8n workflow editor
2. Add Notion node
3. Select "Create Page" operation
4. Set Parent ID to a test page
5. Execute node
6. Verify page appears in Notion

### Test 2: Search Database

1. Add Notion node
2. Select "Search Database" operation
3. Database ID: `{{$env.NOTION_TASKS_DB_ID}}`
4. Add filter: Status = "To Do"
5. Execute and verify results

### Test 3: End-to-End Workflow

1. Send test webhook to n8n
2. Verify n8n workflow executes
3. Check Notion database for new entry
4. Verify all properties populated correctly

## Troubleshooting

### Issue: "Could not connect to Notion"
**Solution**: 
- Verify `NOTION_API_KEY` is correct
- Check integration has access to the database
- Ensure database ID is correct (32 characters)

### Issue: "Database not found"
**Solution**:
- Verify database ID in Replit Secrets
- Share database with "Mundo Tango n8n" integration
- Check database hasn't been deleted/moved

### Issue: "Property validation failed"
**Solution**:
- Check property names match exactly (case-sensitive)
- Verify property types (Title, Rich Text, Select, etc.)
- Ensure required properties are included

### Issue: "Rate limit exceeded"
**Solution**:
- Notion API has rate limits (3 requests/second)
- Add "Wait" nodes between Notion operations
- Batch operations when possible

## Best Practices

1. **Use Environment Variables**: Always reference database IDs from secrets
2. **Error Handling**: Add error nodes to catch Notion API failures
3. **Retry Logic**: Configure automatic retries for transient failures
4. **Batch Operations**: When creating multiple items, batch when possible
5. **Property Validation**: Always validate data before sending to Notion
6. **Logging**: Log all Notion operations for debugging
7. **Access Control**: Only share databases with integration, not entire workspace
8. **Backup**: Regular exports of critical Notion databases

## Next Steps

1. ✅ Notion credentials configured in Replit Secrets
2. ✅ Database IDs stored in environment variables
3. 📝 Create example workflows in n8n (see Workflow 1-5 above)
4. 📝 Test each workflow individually
5. 📝 Integrate with Mr. Blue coordination protocol
6. 📝 Monitor and optimize based on usage patterns

## Additional Resources

- [Notion API Documentation](https://developers.notion.com/)
- [n8n Notion Node Docs](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/)
- [Notion Database Properties](https://developers.notion.com/reference/property-object)
- [Mr. Blue Coordination Protocol](./mr-blue-brain/n8n-coordinator.md)
