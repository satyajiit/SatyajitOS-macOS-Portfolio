import { describe, expect, it } from 'vitest'

import { profile } from '@/content/profile'

import { HistoryCursor } from '../history'
import { joined, makeShell, text } from './helpers'

describe('file commands', () => {
  it('starts in the home directory', () => {
    const shell = makeShell()
    expect(shell.prompt()).toEqual({ user: profile.username, host: 'SatyajitOS', path: '~' })
    expect(joined(shell.run('pwd'))).toBe(`/Users/${profile.username}`)
  })

  it('cd moves around, cd - goes back, errors are zsh-shaped', () => {
    const shell = makeShell()
    shell.run('cd Projects/satyajit-portfolio')
    expect(shell.prompt().path).toBe('~/Projects/satyajit-portfolio')
    shell.run('cd ../..')
    expect(shell.prompt().path).toBe('~')
    shell.run('cd /etc')
    expect(joined(shell.run('cd -'))).toBe('~')

    const missing = shell.run('cd nowhere')
    expect(missing.status).toBe(1)
    expect(joined(missing)).toBe('cd: no such file or directory: nowhere')
    expect(joined(shell.run('cd .zshrc'))).toBe('cd: not a directory: .zshrc')
  })

  it('ls hides dotfiles unless -a, lists directories first', () => {
    const shell = makeShell()
    const plain = joined(shell.run('ls'))
    expect(plain).toContain('Desktop/')
    expect(plain).not.toContain('.zshrc')
    expect(plain.indexOf('Desktop/')).toBeLessThan(plain.indexOf('Projects/'))
    expect(joined(shell.run('ls -a'))).toContain('.zshrc')
    expect(joined(shell.run('ll'))).toMatch(/^total \d+/)
  })

  it('cat prints files and the owner email comes from the profile', () => {
    const shell = makeShell()
    expect(joined(shell.run('cat ~/Documents/ideas.txt'))).toContain('Social network for pets')
    expect(joined(shell.run('cat .gitconfig'))).toContain(`email = ${profile.email}`)
    expect(joined(shell.run('cat Desktop'))).toBe('cat: Desktop: Is a directory')
    expect(shell.run('cat nope.txt').status).toBe(1)
  })

  it('mkdir and touch change the session file system', () => {
    const shell = makeShell()
    shell.run('mkdir playground && cd playground && touch notes.md')
    expect(shell.prompt().path).toBe('~/playground')
    expect(joined(shell.run('ls'))).toBe('notes.md')
    expect(joined(shell.run('mkdir ../playground'))).toBe('mkdir: ../playground: File exists')
  })

  it('pipes text between commands', () => {
    const shell = makeShell()
    expect(joined(shell.run('cat ~/Documents/ideas.txt | grep pets'))).toBe('3. Social network for pets')
    expect(joined(shell.run('ls ~/Downloads | wc -l')).trim()).toBe('3')
  })

  it('&& stops after a failure, ; does not', () => {
    const shell = makeShell()
    expect(joined(shell.run('cd nowhere && echo never'))).not.toContain('never')
    expect(joined(shell.run('cd nowhere ; echo always'))).toContain('always')
  })
})

describe('unknown commands', () => {
  it('prints a zsh-style error, hints, and a close suggestion', () => {
    const result = makeShell().run('lss')
    expect(result.status).toBe(127)
    expect(text(result)[0]).toBe('zsh: command not found: lss')
    expect(joined(result)).toContain('Did you mean: ls?')
  })
})

describe('history', () => {
  it('records commands and walks back and forth with the draft kept', () => {
    const shell = makeShell()
    shell.run('pwd')
    shell.run('whoami')
    shell.run('whoami')
    expect(shell.history).toEqual(['pwd', 'whoami'])

    const cursor = new HistoryCursor(() => shell.history)
    expect(cursor.prev('half-typed')).toBe('whoami')
    expect(cursor.prev('')).toBe('pwd')
    expect(cursor.prev('')).toBeNull()
    expect(cursor.next()).toBe('whoami')
    expect(cursor.next()).toBe('half-typed')
  })
})

describe('tab completion', () => {
  it('completes a unique command name with a trailing space', () => {
    expect(makeShell().complete('neof')).toEqual({ value: 'neofetch ', candidates: [] })
  })

  it('offers candidates when ambiguous', () => {
    const result = makeShell().complete('c')
    expect(result.candidates).toEqual(expect.arrayContaining(['cat', 'cd', 'clear', 'coffee', 'cowsay']))
  })

  it('completes paths, adding / to directories', () => {
    const shell = makeShell()
    expect(shell.complete('cd Proj')).toEqual({ value: 'cd Projects/', candidates: [] })
    expect(shell.complete('cat Projects/satyajit-portfolio/pa')).toEqual({
      value: 'cat Projects/satyajit-portfolio/package.json ',
      candidates: [],
    })
    expect(shell.complete('ls D').candidates).toEqual(['Desktop/', 'Documents/', 'Downloads/'])
  })

  it('only suggests directories after cd', () => {
    expect(makeShell().complete('cd Desktop/').candidates).toEqual([])
  })
})

describe('easter eggs', () => {
  it('sudo rm -rf / is refused, loudly', () => {
    const out = joined(makeShell().run('sudo rm -rf /'))
    expect(out).toContain('[sudo] password for')
    expect(out).toContain('WHOA THERE! That would delete everything!')
    expect(out).toContain('sudo: Nice try!')
  })

  it('please runs the command after a warning', () => {
    const out = joined(makeShell().run('please whoami'))
    expect(out).toBe(`Nice try! Running: whoami\n${profile.username}`)
  })

  it('hack schedules the punchline for later', () => {
    const result = makeShell().run('hack')
    expect(joined(result)).toContain('HACKER MODE ACTIVATED')
    expect(result.effects).toContainEqual(expect.objectContaining({ type: 'later', delay: 1500 }))
  })

  it('cowsay draws the cow around the message', () => {
    const out = text(makeShell().run('cowsay moo'))
    expect(out[1]).toBe('< moo >')
    expect(out).toContain('                ||----w |')
  })

  it('theme switches and exit asks the window to close', () => {
    const shell = makeShell('mobile')
    expect(shell.run('theme ocean').effects).toEqual([{ type: 'theme', theme: 'ocean' }])
    expect(shell.theme).toBe('ocean')
    expect(shell.run('exit').effects).toEqual([{ type: 'exit' }])
    expect(joined(shell.run('uname'))).toContain('Android')
  })

  it('neofetch puts the logo beside the info on wide screens only', () => {
    const wide = text(makeShell('desktop', 80).run('neofetch'))
    expect(wide[0]).toMatch(/▄████▀\s+satyajit@SatyajitOS/)
    const narrow = text(makeShell('mobile', 40).run('neofetch'))
    expect(narrow[0]).toContain('▄████▀')
    expect(narrow[0]).not.toContain('@')
  })

  it('help lists every group', () => {
    const out = joined(makeShell().run('help'))
    for (const heading of ['File Operations', 'System Information', 'Developer Tools', 'Fun Commands', 'Utilities']) {
      expect(out).toContain(heading)
    }
  })
})
