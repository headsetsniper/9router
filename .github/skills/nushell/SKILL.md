---
name: nushell
description: Write, execute, translate, or debug Nushell commands, pipelines, and .nu files. Use for all terminal work when Nushell is the active shell. Prevent Bash or PowerShell syntax leakage and hallucinated executables.
---

# Nushell

The shell is Nushell (`nu`), not Bash, Zsh, CMD, or PowerShell.

## Rules

- Prefer typed Nushell pipelines and built-ins.
- Never assume a Unix utility exists. Check unfamiliar commands with `which <name>`.
- Check Nu syntax with `help <command>` and pipeline types with `describe`.
- After an error, inspect; do not guess variants or escape into another shell.
- Use external programs such as `git`, `dotnet`, `npm`, or `docker` only when installed. `^name` explicitly selects an external command.
- Output commands directly pasteable into Nu.
- For terminal output consumed by an LLM, select only required columns, remove repeated path prefixes with `path basename` or `path relative-to`, and prefer compact `to tsv --noheaders` output over rendered tables.

## Essential syntax

| Intent               | Nushell                             |
| -------------------- | ----------------------------------- |
| Read structured file | `open file.json`                    |
| Read raw text        | `open --raw file.txt`               |
| Environment variable | `$env.NAME` / `$env.NAME = "value"` |
| Command result       | `(command)`                         |
| Interpolation        | `$"value: ($value)"`                |
| Expand argument list | `command ...$args`                  |
| Filter rows          | `where`                             |
| Select fields        | `get`, `select`                     |
| Transform            | `each`, `update`, `insert`          |
| Search values/text   | `find`, `str contains`              |
| Replace text         | `str replace`                       |
| Find paths           | `glob`, `ls`                        |
| Parallel map         | `par-each`                          |

```nu
ls
| where type == file
| where size > 10mb
| select name size modified
| sort-by size --reverse
```

```nu
let branch = (git branch --show-current | str trim)
print $"Current branch: ($branch)"
```

Do not use Bash forms such as `$VAR`, `export X=y`, `$(cmd)`, backticks, `&&`, or `VAR=value command`. Do not replace structured data with `rg | grep | awk | sed | jq` unless an installed external is specifically required.
remember that you can call external tools with ^ prefix, but dont expect linux native commands, you are still in windows terminal

### Bash → Nushell Quick Reference

| Bash                  | Nushell                                  | Notes             |
| --------------------- | ---------------------------------------- | ----------------- |
| `grep pattern`        | `where $it =~ pattern` or `find pattern` | Structured filter |
| `sed 's/a/b/'`        | `str replace a b`                        | String ops        |
| `awk '{print $1}'`    | `get 0` or `select col`                  | Column access     |
| `jq '.key'`           | `get key`                                | JSON native       |
| `find . -name "*.ts"` | `ls **/*.ts`                             | Glob built-in     |
| `xargs cmd`           | `each { cmd $in }`                       | Iteration         |
| `cat file`            | `open file`                              | Structured read   |
| `> file`              | `\| save file`                           | Redirect          |
| `>> file`             | `\| save -a file`                        | Append            |
| `> /dev/null`         | `\| ignore`                              | Discard           |
| `$VAR`                | `$env.VAR`                               | Env vars          |
| `export FOO=bar`      | `$env.FOO = "bar"`                       | Set env           |
| `$(cmd)`              | `(cmd)`                                  | Subshell          |
| `"Hello $name"`       | `$"Hello ($name)"`                       | Interpolation     |
| `cmd1 && cmd2`        | `cmd1; cmd2`                             | Sequence          |

**Gotchas:**

- `$in` in closures (not `$it`): `each { $in * 2 }`
- `^git` for external commands
- Row conditions auto-expand: `where size > 1MB` = `where $it.size > 1MB`
- Use cross-platform path syntax with forward slashes (`C:/Users/name`, `./file`, `../directory`); quote paths containing spaces and use `cd C:/...` instead of CMD-style drive switching such as bare `C:`.
