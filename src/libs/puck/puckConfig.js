import { Text } from "@/views/contents/components/puck/blocks/Text";
import { RichText } from "@/views/contents/components/puck/blocks/RichText";
import { Grid } from "@/views/contents/components/puck/blocks/Grid";
import { GridItem } from "@/views/contents/components/puck/blocks/GridItem";
import { Flex } from "@/views/contents/components/puck/blocks/Flex";
import { Space } from "@/views/contents/components/puck/blocks/Space";
import { PuckButton } from "@/views/contents/components/puck/blocks/Button";
import { QuestionField } from "@/views/contents/components/puck/blocks/QuestionField";
import { Table } from "@/views/contents/components/puck/blocks/Table";
import { AdvancedTable } from "@/views/contents/components/puck/blocks/AdvancedTable";
import { PronunciationBlock } from "@/views/contents/components/puckComponents/PronunciationVocabulary";
import { ImportantAlert } from "@/views/contents/components/puckComponents/ImportantAlert";
import { PronunciationConversation } from "@/views/contents/components/puckComponents/PronunciationConversation";
import { ButtonAudio } from "@/views/contents/components/puckComponents/ButtomAudio";
import { ButtonAudioSlow } from "@/views/contents/components/puckComponents/ButtonLento";
import { TextBox } from "@/views/contents/components/puckComponents/TextBox";
import { ImgAudio } from "@/views/contents/components/puckComponents/ImgAudio";
import { ImgReceptiva } from "@/views/contents/components/puckComponents/ImgReceptiva";
import { WordMatchValidator } from "@/views/contents/components/puckComponents/WordMatchValidator";
import { WordScramble } from "@/views/contents/components/puckComponents/WordScramble";
import { PronounQuiz } from "@/views/contents/components/puckComponents/PronounQuiz";
import { QueAprendi } from "@/views/contents/components/puckComponents/que-aprendi/QueAprendi";

import { Simulator } from "@/views/contents/components/puck/blocks/Simulator";
import { CountdownTimer } from "@/views/contents/components/puck/blocks/CountdownTimer";

import { VideoTutorial } from "@/views/contents/components/puckComponents/VideoTutorial";
import { Video } from "@/views/contents/components/puckComponents/Video";
import { Blank } from "@/views/contents/components/puck/blocks/Blank";
import { Card } from "@/views/contents/components/puck/blocks/Card";
import { Content } from "@/views/contents/components/puck/blocks/Content";
import { Heading } from "@/views/contents/components/puck/blocks/Heading";
import { Hero } from "@/views/contents/components/puck/blocks/Hero";
import { Iframe } from "@/views/contents/components/puck/blocks/Iframe";
import { Logos } from "@/views/contents/components/puck/blocks/Logos";

export { default as getClassNameFactory } from "./get-class-name-factory";

export const config = {
  root: {
    fields: {
      containerType: {
        type: 'select',
        label: 'Tipo de contenedor (Page)',
        options: [
          { label: 'Fluid (100%)', value: '100%' },
          { label: 'Container (90%)', value: '90%' },
          { label: 'Container (80%)', value: '80%' },
          { label: 'Container (1280px)', value: '1280px' },
          { label: 'Container (1024px)', value: '1024px' },
          { label: 'Container (900px)', value: '900px' }
        ]
      }
    },
    defaultProps: {
      containerType: '100%'
    },
    render: ({ children, containerType = '100%' }) => {
      return (
        <div style={{
          maxWidth: containerType,
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%'
        }}>
          {children}
        </div>
      )
    }
  },
  categories: {
    content: {
      title: '📝 Texto y Contenido',
      components: ['Text', 'RichText']
    },
    layout: {
      title: '📐 Diseño y Estructura',
      components: ['Grid', 'GridItem', 'Flex', 'Space']
    },
    tables: {
      title: '📊 Tablas y Datos',
      components: ['Table', 'AdvancedTable']
    },
    controls: {
      title: '🎮 Controles e Interacción',
      components: ['PuckButton', 'QuestionField']
    },
    multimedia: {
      title: '🎬 Multimedia',
      components: ['ImgReceptiva', 'ButtonAudio', 'ButtonAudioSlow', 'ImgAudio', 'VideoTutorial', 'Video', 'Iframe']
    },
    educational: {
      title: '🎓 Actividades Educativas',
      components: [
        'PronunciationBlock',
        'PronunciationConversation',
        'TextBox',
        'WordMatchValidator',
        'WordScramble',
        'QueAprendi',
        'Simulator',
        'CountdownTimer'
      ]
    },
    feedback: {
      title: '💬 Notificaciones y Alertas',
      components: ['ImportantAlert']
    },
    // advanced: {
    //   title: '⚙️ Avanzados',
    //   components: []
    // }
  },
  components: {
    Text,
    RichText,
    Grid,
    GridItem,
    Flex,
    Space,
    PuckButton,
    QuestionField,
    Table,
    AdvancedTable,
    PronunciationBlock,
    ImportantAlert,
    PronunciationConversation,
    ButtonAudio,
    ButtonAudioSlow,
    TextBox,
    ImgAudio,
    ImgReceptiva,
    VideoTutorial,
    Video,
    Iframe,
    WordMatchValidator,
    WordScramble,
    QueAprendi,
    Simulator,
    CountdownTimer
  }
}

export const initialData = {
  content: [],
  root: { props: {} }
}

export const componentKey = Buffer.from(
  `contents-${Object.keys(config.components).join('-')}-${JSON.stringify(initialData)}`
).toString('base64')

console.log("componentKey")

export const contentComponentKey = componentKey
