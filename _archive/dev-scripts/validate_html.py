from html.parser import HTMLParser

class Validator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.errors = []
        self.tag_stack = []

    def handle_starttag(self, tag, attrs):
        void_tags = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
        if tag not in void_tags:
            self.tag_stack.append(tag)

    def handle_endtag(self, tag):
        void_tags = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
        if tag in void_tags:
            return
        if self.tag_stack and self.tag_stack[-1] == tag:
            self.tag_stack.pop()
        else:
            # Check if tag is in stack
            if tag in self.tag_stack:
                while self.tag_stack and self.tag_stack[-1] != tag:
                    self.tag_stack.pop()
                if self.tag_stack:
                    self.tag_stack.pop()
            else:
                self.errors.append(f"Unexpected closing tag </{tag}> at line {self.getpos()[0]}")

pages = [
  'index.html',
  'virtual-office.html',
  'coworking-spaces.html',
  'meeting-rooms.html',
  'locations.html',
  'pricing.html',
  'company-registration.html',
  'portal.html',
  'admin.html',
  'contact.html',
  '404.html'
]

for p in pages:
    val = Validator()
    with open(p, encoding='utf-8') as f:
        content = f.read()
    val.feed(content)
    print(f"[{p}] Tag stack remaining: {len(val.tag_stack)}, Errors: {len(val.errors)}")
    if val.errors:
        print(f"  First 3 errors: {val.errors[:3]}")
    if val.tag_stack:
        print(f"  Unclosed tags: {val.tag_stack[:5]}")
