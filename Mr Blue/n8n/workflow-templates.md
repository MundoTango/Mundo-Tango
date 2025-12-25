# n8n Workflow Templates

**Invocation:** `use mb.md: n8n:templates`

---

## 📋 READY-TO-USE WORKFLOWS

### 1. Daily Health Check & Alert

```json
{
  "name": "Daily Mr. Blue Health Check",
  "nodes": [
    {
      "type": "schedule",
      "settings": {
        "rule": "0 6 * * *",
        "timezone": "America/New_York"
      }
    },
    {
      "type": "httpRequest",
      "settings": {
        "method": "POST",
        "url": "{{$env.MUNDO_TANGO_URL}}/api/mrblue/audit/full",
        "headers": {
          "Authorization": "Bearer {{$credentials.mrBlueApiKey}}"
        }
      }
    },
    {
      "type": "if",
      "settings": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.healthScore}}",
              "operation": "smaller",
              "value2": 90
            }
          ]
        }
      }
    },
    {
      "type": "slack",
      "settings": {
        "channel": "#alerts",
        "text": "⚠️ Mr. Blue Health Alert\nScore: {{$json.healthScore}}/100\nIssues: {{$json.issues.length}}"
      }
    }
  ]
}
```

### 2. Event Scraping Pipeline

```json
{
  "name": "Tango Event Scraper",
  "nodes": [
    {
      "type": "schedule",
      "settings": {
        "rule": "0 */4 * * *"
      }
    },
    {
      "type": "httpRequest",
      "name": "Start Scrape",
      "settings": {
        "method": "POST",
        "url": "{{$env.MUNDO_TANGO_URL}}/api/admin/unified-scrape",
        "headers": {
          "Authorization": "Bearer {{$credentials.mrBlueApiKey}}"
        },
        "body": {
          "sources": ["hoy-milonga", "tango-cat", "tango-festivals"]
        }
      }
    },
    {
      "type": "wait",
      "settings": {
        "unit": "minutes",
        "amount": 5
      }
    },
    {
      "type": "httpRequest",
      "name": "Get Status",
      "settings": {
        "method": "GET",
        "url": "{{$env.MUNDO_TANGO_URL}}/api/admin/unified-scraper-status"
      }
    },
    {
      "type": "if",
      "name": "New Events?",
      "settings": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.newEvents}}",
              "operation": "larger",
              "value2": 0
            }
          ]
        }
      }
    },
    {
      "type": "discord",
      "settings": {
        "webhookUrl": "{{$env.DISCORD_WEBHOOK}}",
        "content": "🎉 New tango events found!\n{{$json.newEvents}} events from {{$json.sources.join(', ')}}"
      }
    },
    {
      "type": "googleSheets",
      "name": "Log Results",
      "settings": {
        "operation": "append",
        "sheetId": "{{$env.LOG_SHEET_ID}}",
        "range": "Scraping!A:E",
        "values": [
          "={{$now.toISO()}}",
          "={{$json.totalEvents}}",
          "={{$json.newEvents}}",
          "={{$json.errors.length}}",
          "={{$json.sources.join(', ')}}"
        ]
      }
    }
  ]
}
```

### 3. Error Alert Pipeline

```json
{
  "name": "Mr. Blue Error Alerts",
  "nodes": [
    {
      "type": "webhook",
      "settings": {
        "path": "mr-blue-error",
        "method": "POST"
      }
    },
    {
      "type": "switch",
      "name": "Route by Severity",
      "settings": {
        "rules": [
          {
            "output": 0,
            "conditions": {
              "string": [
                {
                  "value1": "={{$json.severity}}",
                  "value2": "critical"
                }
              ]
            }
          },
          {
            "output": 1,
            "conditions": {
              "string": [
                {
                  "value1": "={{$json.severity}}",
                  "value2": "high"
                }
              ]
            }
          }
        ],
        "fallbackOutput": 2
      }
    },
    {
      "type": "pagerDuty",
      "name": "Critical Alert",
      "settings": {
        "severity": "critical",
        "summary": "{{$json.message}}",
        "source": "Mr. Blue - {{$json.agent}}"
      }
    },
    {
      "type": "slack",
      "name": "High Alert",
      "settings": {
        "channel": "#alerts",
        "text": "🔴 High Priority Error\n*Agent:* {{$json.agent}}\n*Message:* {{$json.message}}"
      }
    },
    {
      "type": "slack",
      "name": "Medium Alert",
      "settings": {
        "channel": "#logs",
        "text": "⚠️ {{$json.agent}}: {{$json.message}}"
      }
    }
  ]
}
```

### 4. New User Onboarding

```json
{
  "name": "User Onboarding Sequence",
  "nodes": [
    {
      "type": "webhook",
      "settings": {
        "path": "new-user",
        "method": "POST"
      }
    },
    {
      "type": "httpRequest",
      "name": "Get User Profile",
      "settings": {
        "method": "GET",
        "url": "{{$env.MUNDO_TANGO_URL}}/api/users/{{$json.userId}}"
      }
    },
    {
      "type": "httpRequest",
      "name": "Generate Welcome Message",
      "settings": {
        "method": "POST",
        "url": "{{$env.MUNDO_TANGO_URL}}/api/mrblue/chat",
        "body": {
          "message": "Generate a personalized welcome message for a new tango dancer named {{$json.name}} from {{$json.city}}. They are interested in {{$json.interests.join(', ')}}.",
          "context": {
            "source": "n8n",
            "type": "onboarding"
          }
        }
      }
    },
    {
      "type": "sendGrid",
      "name": "Send Welcome Email",
      "settings": {
        "to": "={{$json.email}}",
        "subject": "Welcome to Mundo Tango, {{$json.name}}!",
        "html": "={{$node['Generate Welcome Message'].json.response}}"
      }
    },
    {
      "type": "wait",
      "settings": {
        "unit": "days",
        "amount": 3
      }
    },
    {
      "type": "httpRequest",
      "name": "Get Nearby Events",
      "settings": {
        "method": "GET",
        "url": "{{$env.MUNDO_TANGO_URL}}/api/events?city={{$json.city}}&limit=5"
      }
    },
    {
      "type": "sendGrid",
      "name": "Send Events Email",
      "settings": {
        "to": "={{$json.email}}",
        "subject": "Tango events near you this week",
        "template": "events-digest"
      }
    }
  ]
}
```

### 5. Weekly Analytics Report

```json
{
  "name": "Weekly Analytics Report",
  "nodes": [
    {
      "type": "schedule",
      "settings": {
        "rule": "0 9 * * 1",
        "timezone": "America/New_York"
      }
    },
    {
      "type": "httpRequest",
      "name": "Get Dashboard Data",
      "settings": {
        "method": "GET",
        "url": "{{$env.MUNDO_TANGO_URL}}/api/admin/dashboard",
        "headers": {
          "Authorization": "Bearer {{$credentials.mrBlueApiKey}}"
        }
      }
    },
    {
      "type": "httpRequest",
      "name": "Get Agent Metrics",
      "settings": {
        "method": "GET",
        "url": "{{$env.MUNDO_TANGO_URL}}/api/mrblue/agents?includeMetrics=true"
      }
    },
    {
      "type": "code",
      "name": "Format Report",
      "settings": {
        "language": "javascript",
        "code": "const dashboard = $input.all()[0].json;\nconst agents = $input.all()[1].json;\n\nreturn [{\n  json: {\n    summary: `Weekly Report\\n\\nUsers: ${dashboard.users.total}\\nEvents: ${dashboard.events.total}\\nHealth: ${dashboard.health.score}/100\\n\\nTop Agents:\\n${agents.slice(0,5).map(a => `- ${a.name}: ${a.metrics.successRate}%`).join('\\n')}`\n  }\n}];"
      }
    },
    {
      "type": "slack",
      "settings": {
        "channel": "#weekly-reports",
        "text": "📊 *Weekly Mundo Tango Report*\n\n{{$json.summary}}"
      }
    }
  ]
}
```

---

## 🔧 IMPORT INSTRUCTIONS

1. Open n8n
2. Click "Import from JSON"
3. Paste template
4. Configure credentials:
   - `mrBlueApiKey`: Your API key
   - `MUNDO_TANGO_URL`: Base URL
5. Activate workflow

---

## 📊 ENVIRONMENT VARIABLES

```
MUNDO_TANGO_URL=https://mundo-tango.replit.app
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
LOG_SHEET_ID=your-google-sheet-id
```

---

*Copy. Paste. Automate.*
