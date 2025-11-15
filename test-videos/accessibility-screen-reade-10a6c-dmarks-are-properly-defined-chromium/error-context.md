# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - generic [ref=e3]:
    - generic [ref=e5]:
      - button "Text Chat" [ref=e6] [cursor=pointer]:
        - img
        - generic [ref=e7]: Text Chat
      - button "Voice Chat" [ref=e8] [cursor=pointer]:
        - img
        - generic [ref=e9]: Voice Chat
      - button "Vibecoding" [ref=e10] [cursor=pointer]:
        - img
        - generic [ref=e11]: Vibecoding
      - button "Visual Editor" [ref=e12] [cursor=pointer]:
        - img
        - generic [ref=e13]: Visual Editor
    - generic [ref=e15]:
      - generic [ref=e20]:
        - img [ref=e23]
        - generic [ref=e27]:
          - paragraph [ref=e28]: Hi! I'm Mr. Blue, your AI companion. I can help you navigate the platform, answer questions, and provide personalized recommendations. What can I help you with today?
          - generic [ref=e30]: 9:53:51 PM
      - generic [ref=e32]:
        - textbox "Ask me anything..." [ref=e33]
        - button [disabled]:
          - img
  - button "Ask Mr. Blue" [ref=e35] [cursor=pointer]:
    - img
    - text: Ask Mr. Blue
  - button [ref=e36] [cursor=pointer]:
    - img
```