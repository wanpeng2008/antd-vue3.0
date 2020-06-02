import fs from 'fs';
import {Component} from './components';

const componentList = require('./components');
const basePath = 'src/components';
const renderTemplate = require('./tmpl').render;

interface DemoDescriptor {
  fileName: string;
  markdownFileContent: string;
  name: string;
  /** 标题 */
  title: string;
  vueFileContent: string;
}

console.log('生成文档中……');

function createDemoFile(component: Component, componentDemoRootPath, demoName, fileName, vueContent) {
  const name = demoName.substring(0, 1).toUpperCase() + demoName.substring(1);
  const content = renderTemplate('src/templates/demo-index.vue.tmpl', {
    name, demoName, dir: component.id, fileName
  });
  const componentGeneratedFilePath = 'src/generated/' + component.id;
  if (!fs.existsSync(componentGeneratedFilePath)) {
    fs.mkdirSync(componentGeneratedFilePath);
  }
  const demoDir = `src/packages/${component.name}/demo`;
  if (!fs.existsSync(demoDir)) {
    fs.mkdirSync(demoDir);
  }
  fs.writeFileSync(`${componentGeneratedFilePath}/${demoName}.txt`, vueContent);
  fs.writeFileSync(`${componentGeneratedFilePath}/${demoName}.vue`, content);
}

const titleMap = {
  props: '属性说明',
  events: '事件说明',
  functions: '方法说明',
  slots: '插槽说明'
};

function createDemoTemplate(demos: DemoDescriptor[], options) {
  const demoComponents = demos.map(it => it.name).map(it => `    <${it} id="${it}"/>`).join('\n');
  const mdComponents = ['props', 'events', 'functions', 'slots'].map(it => {
    if (options[it]) {
      return `<div class="markdown-body" id="${it}">
      <span></span>
      <h2>${titleMap[it]}</h2>
    </div>
    <markdown :source="${it}"/>`;
    } else {
      return '';
    }
  }).filter(it => it.length > 0).join('\n\t\t');
  const title = options.title ? '<markdown :source="title"/>' : '';
  return renderTemplate('src/templates/demo.vue.tmpl', {
    title,
    demoComponents,
    mdComponents,
    anchors: '',
    propsExists: options['props'] || false,
    eventsExists: options['events'] || false,
    functionsExists: options['functions'] || false,
    slotsExists: options['slots'] || false
  });
}

/**
 * 生成组件的示例页和说明页
 * @param {Component} component
 * @param componentDemoRootPath
 * @param {DemoDescriptor[]} demos
 */
function createDemoIndex(component: Component, componentDemoRootPath, demos: DemoDescriptor[]) {
  const demoImports = demos.map(it => `  import ${it.name} from './${it.name}.vue';`)
      .join('\n');
  const options = {
    title: fs.existsSync(componentDemoRootPath + '/README.md'),
    props: fs.existsSync(componentDemoRootPath + '/props.md'),
    events: fs.existsSync(componentDemoRootPath + '/events.md'),
    functions: fs.existsSync(componentDemoRootPath + '/functions.md'),
    slots: fs.existsSync(componentDemoRootPath + '/slots.md')
  };
  const mdImports = Object.keys(options)
      .map(it => options[it] ? `import ${it} from '../../packages/${component.id}/demo/${it === 'title' ? 'README' : it}.md';` : '')
      .filter(it => it.length > 0)
      .join('\n  ');
  const mdProps = Object.keys(options)
      .map(it => options[it] ? `public ${it} = ${it};` : '')
      .filter(it => it.length > 0)
      .join('\n    ');

  function generateDecorator(demos: DemoDescriptor[]) {
    if (demos.length) {
      return `@Component({
    name: 'ComponentDemo',
    components: {
      ${demos.map(it => it.name).join(', ')}
    }
  })`;
    } else {
      return `@Component({
    name: 'ComponentDemo'
  })`;
    }
  }

  const content = `${createDemoTemplate(demos, options)}
<script lang="ts">
${demoImports}
  
  import Vue from 'vue';
  import Component from 'vue-class-component';
${component.type !== 'tool' ? `  import ${component.upperCase} from '@/packages/${component.id}';` : ''}
  ${mdImports}

${component.type !== 'tool' ? `  Vue.use(${component.upperCase});` : ''}
  ${generateDecorator(demos)}
  export default class ComponentDemo extends Vue {
${mdProps ? `    ${mdProps}` : ''}

    public getContainer() {
      return document.getElementById('app-content');
    }
  }
</script>
<style lang="less" scoped>
  .toc-affix {
    width: 150px;
    position: fixed;
    top: 100px;
    right: 10px;
    bottom: 250px;
    z-index: 500;
  }
</style>
`;
  const dir = 'src/generated/' + component.id;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const demoPageContent = renderTemplate('src/templates/demo.tmpl', {
    tmpl: demos.map(demo => {
      return `<demo-wrapper title="${demo.title}">
      <${demo.name}/>
    </demo-wrapper>`;
    }).join('\n\t\t'),
    imports: demos.map(demo => {
      return `import ${demo.name} from '@/packages/${component.name}/demo/${demo.fileName}';`;
    }).join('\n  '),
    components: demos.length ? demos.map(demo => demo.name).join(', ') + ',' : ''
  });
  fs.writeFileSync('src/generated/' + component.id + '/index.vue', content);
  fs.writeFileSync('src/generated/' + component.id + '/demo.vue', demoPageContent);
}

/**
 * 生成入口文件src/packages/index.ts
 */
export default function generateMainFile() {
  const componentList: Component[] = require('./components');
  const res = renderTemplate('build/templates/index.ts.tmpl', {
    imports: componentList.map(it => {
      return `import ${it.upperCase} from './${it.id}';`;
    }).join('\n'),
    vueComponents: componentList.filter(it => it.type !== 'tool').map(it => it.upperCase).join(',\n\t'),
    components: componentList.map(it => it.upperCase).join(',\n\t')
  });
  fs.writeFileSync(`${basePath}/index.ts`, res);
}
const createDemo = require('./create');
generateMainFile();
componentList.forEach((component: Component) => {
  createDemo(component.id)
  // resolveDemo(component);
});
require('./router');
