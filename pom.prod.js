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
    { name: 'vendor/foam3/src/foam/lang/events' },
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
    { name: 'vendor/foam3/src/foam/lang/Script' },
    { name: 'vendor/foam3/src/foam/pattern/Faceted' },
    { name: 'vendor/foam3/src/foam/lang/types' },
    { name: 'vendor/foam3/src/foam/lang/FObjectArray' },
    { name: 'vendor/foam3/src/foam/lang/Constant' },
    { name: 'vendor/foam3/src/foam/lang/Topic' },
    { name: 'vendor/foam3/src/foam/lang/InnerClass' },
    { name: 'vendor/foam3/src/foam/lang/InnerEnum' },
    { name: 'vendor/foam3/src/foam/lang/Mixin' },
    { name: 'vendor/foam3/src/foam/lang/Implements' },
    { name: 'vendor/foam3/src/foam/lang/ImportsExports' },
    { name: 'vendor/foam3/src/foam/lang/Listener' },
    { name: 'vendor/foam3/src/foam/lang/IDSupport' },
    { name: 'vendor/foam3/src/foam/lang/Requires' },
    { name: 'vendor/foam3/src/foam/lang/Slot' },
    { name: 'vendor/foam3/src/foam/lang/Interface' },
    { name: 'vendor/foam3/src/foam/lang/Axiom' },
    { name: 'vendor/foam3/src/foam/lang/ContextMethod' },
    { name: 'vendor/foam3/src/foam/lang/Window' },
    { name: 'vendor/foam3/src/foam/lang/ContextMultipleInheritence' },
    { name: 'vendor/foam3/src/foam/lang/Argument' },
    { name: 'vendor/foam3/src/foam/pattern/Singleton' },
    { name: 'vendor/foam3/src/foam/pattern/Multiton' },
    { name: 'vendor/foam3/src/foam/lang/Enum' },
    { name: 'vendor/foam3/src/foam/lang/Action' },
    { name: 'vendor/foam3/src/foam/lang/Static' },
    { name: 'vendor/foam3/src/foam/lang/Fluent' },
    { name: 'vendor/foam3/src/foam/lang/Detachable' },

    { name: 'vendor/foam3/src/foam/dao/SQLStatement' },
    { name: 'vendor/foam3/src/foam/dao/Sink' },
    { name: 'vendor/foam3/src/foam/mlang/order/Comparator' },
    { name: 'vendor/foam3/src/foam/mlang/Expressions' },

    { name: 'vendor/foam3/src/foam/apploader/NoClassLoader' },

    { name: 'vendor/foam3/src/foam/u2/AttrSlot' },
    { name: 'vendor/foam3/src/foam/u2/ViewSpec' },
    { name: 'vendor/foam3/src/foam/u2/WeakMap' },
    { name: 'vendor/foam3/src/foam/u2/ControllerMode' },
    { name: 'vendor/foam3/src/foam/u2/DisplayMode' },
    { name: 'vendor/foam3/src/foam/u2/CSS' },
    { name: 'vendor/foam3/src/foam/u2/Element2' },
    { name: 'vendor/foam3/src/foam/u2/U2Context' },
    { name: 'vendor/foam3/src/foam/u2/tag/Foam' },
    { name: 'vendor/foam3/src/foam/u2/FoamTagLoader' },

    { name: 'vendor/foam3/src/foam/input/TouchEvent' },
    { name: 'vendor/foam3/src/foam/input/Mouse' },
    { name: 'vendor/foam3/src/foam/input/Touch' },
    { name: 'vendor/foam3/src/foam/input/Pointer' },
    { name: 'vendor/foam3/src/foam/graphics/CView' },

    { name: 'src/woodblock/Theme' },
    { name: 'src/woodblock/Piece' },
    { name: 'src/woodblock/Game' },
    { name: 'src/woodblock/GameView' }
  ]
});
