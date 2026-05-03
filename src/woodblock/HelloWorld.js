foam.CLASS({
  package: 'woodblock',
  name: 'HelloWorld',
  extends: 'foam.u2.Element',

  methods: [
    function render() {
      this.SUPER();
      this.add('Hello, Woodblock.');
    }
  ]
});
