foam.POM({
  name: 'woodblock-game',
  version: '0.1.0',

  projects: [
    { name: 'vendor/foam3/src/pom' }
  ],

  files: [
    { name: 'src/woodblock/Theme', flags: 'web' },
    { name: 'src/woodblock/Piece', flags: 'web' },
    { name: 'src/woodblock/Game', flags: 'web' },
    { name: 'src/woodblock/GameView', flags: 'web' }
  ]
});
