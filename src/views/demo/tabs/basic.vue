<template>
  <code-box>
    <a-tabs default-active-key="1" @change="callback">
      <a-tab-pane key="1" tab="Tab 1">
        Content of Tab Pane 1
      </a-tab-pane>
      <a-tab-pane key="2" tab="Tab 2" force-render>
        Content of Tab Pane 2
      </a-tab-pane>
      <a-tab-pane key="3" tab="Tab 3">
        Content of Tab Pane 3
      </a-tab-pane>
    </a-tabs>
  </code-box>
</template>
<script>
  import CodeBox from '@/views/demo/code-box';
  export default {
    components: { CodeBox },
    data() {
      return {};
    },
    methods: {
      callback(key) {
        console.log(key);
      },
    },
  };
</script>
