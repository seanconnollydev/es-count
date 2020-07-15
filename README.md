# es-count
A small JS utility that counts usage of modules in a code base.

## Usage
```
Usage: es-count [options] <module>

Options:
  -d, --debug
  -g, --glob <glob>  the glob pattern to evaluate (default: "**/*.js")
  -h, --help         display help for command
```

### Example
`npx es-count semantic-ui-react`

Output:
```
Evaluating **/*.js
Evaluating 418 files...

Header: 40
Button: 26
Icon: 15
Container: 13
Divider: 11
Form: 9
Message: 7
Modal: 7
Image: 7
Card: 7
Popup: 6
Grid: 4
Confirm: 3
List: 3
Statistic: 3
Radio: 2
CardContent: 2
Menu: 2
Dropdown: 2
Table: 2
Checkbox: 1
Input: 1
Loader: 1
Dimmer: 1
Pagination: 1
```