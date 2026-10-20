import { consola } from 'consola'

const fs = require('fs').promises

const staticMenuFiles = ['src/components/layout/vertical/VerticalMenu.jsx']

const menuDataFiles = ['src/data/navigation/verticalMenuData.jsx']

const removeTranslationInNavigation = async path => {
  consola.start('Removing translation in navigation files...')
  let fileContent = await fs.readFile(path, 'utf8')

  fileContent = fileContent.replace(/href={`\/\$\{locale\}\/(.*?)`}/g, (match, p1) => {
    if (p1.includes('${')) {
      return `href={\`/${p1}\`}`
    } else {
      return `href='/${p1}'`
    }
  })

  fileContent = fileContent
    .replace(/label=\{dictionary\['navigation'\]\.(\w+)\}/g, "label='$1'")
    .replace(/\{dictionary\['navigation'\]\.(\w+)\}/g, '$1')

  await fs.writeFile(path, fileContent)
  consola.success('Removed translation in navigation files successfully!\n')
}

const updateMenuFiles = async () => {
  for (const path of [...staticMenuFiles, ...menuDataFiles]) {
    await removeTranslationInNavigation(path)
  }
}

updateMenuFiles().catch(consola.error)
