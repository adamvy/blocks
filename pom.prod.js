foam.POM({
  name: 'woodblock-game-prod',
  version: '0.1.0',
  defaultStage: 0,

  licenses: [
    `
    Copyright 2024 The FOAM Authors. All Rights Reserved.
    http://www.apache.org/licenses/LICENSE-2.0
    `,
    `
    Copyright 2016 Google Inc. All Rights Reserved.
    http://www.apache.org/licenses/LICENSE-2.0
    `
  ],

  files: [
    { name: 'vendor/foam3/src/foam/lang/lib' },
    { name: 'vendor/foam3/src/foam/lang/stdlib' },
    { name: 'vendor/foam3/src/foam/lang/Context' },
    { name: 'vendor/foam3/src/foam/lang/LocalStorage' },
    { name: 'vendor/foam3/src/foam/lang/Boot' },
    { name: 'vendor/foam3/src/foam/lang/FObject' },
    { name: 'vendor/foam3/src/foam/lang/Model' },
    { name: 'vendor/foam3/src/foam/lang/Property' },
    { name: 'vendor/foam3/src/foam/lang/Simple' },
    { name: 'vendor/foam3/src/foam/lang/Method' },
    { name: 'vendor/foam3/src/foam/lang/Boolean' },
    { name: 'vendor/foam3/src/foam/lang/AxiomArray' },
    { name: 'vendor/foam3/src/foam/lang/EndBoot' },
    { name: 'vendor/foam3/src/foam/pattern/Faceted' },
    { name: 'vendor/foam3/src/foam/lang/types' },
    { name: 'vendor/foam3/src/foam/lang/FObjectArray' },
    { name: 'vendor/foam3/src/foam/lang/Constant' },
    { name: 'vendor/foam3/src/foam/lang/Topic' },
    // Woodblock does not use Element2's optional Fluent or mlang mixins.
    { name: 'vendor/foam3/src/foam/lang/ImportsExports' },
    { name: 'vendor/foam3/src/foam/lang/Listener' },
    { name: 'vendor/foam3/src/foam/lang/Requires' },
    { name: 'vendor/foam3/src/foam/lang/Slot' },
    { name: 'vendor/foam3/src/foam/lang/ContextMethod' },
    { name: 'vendor/foam3/src/foam/lang/Window' },
    { name: 'vendor/foam3/src/foam/lang/Argument' },
    { name: 'vendor/foam3/src/foam/pattern/Singleton' },
    { name: 'vendor/foam3/src/foam/pattern/Multiton' },
    { name: 'vendor/foam3/src/foam/lang/Enum' },
    { name: 'vendor/foam3/src/foam/lang/Action' },
    { name: 'vendor/foam3/src/foam/lang/Static' },

    { name: 'vendor/foam3/src/foam/apploader/NoClassLoader' },

    { name: 'vendor/foam3/src/foam/u2/ViewSpec' },
    { name: 'vendor/foam3/src/foam/u2/ControllerMode' },
    { name: 'vendor/foam3/src/foam/u2/CSS' },
    { name: 'vendor/foam3/src/foam/u2/Element2' },
    { name: 'vendor/foam3/src/foam/u2/U2Context' },
    // This loader owns the <foam> bootstrap; the custom-tag adapter is redundant.
    { name: 'vendor/foam3/src/foam/u2/FoamTagLoader' },

    { name: 'vendor/foam3/src/foam/graphics/CView' },

    { name: 'src/woodblock/Theme' },
    { name: 'src/woodblock/Piece' },
    { name: 'src/woodblock/Game' },
    { name: 'src/woodblock/GameView' }
  ]
});
