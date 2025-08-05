import { useState, useEffect } from 'react'

export type Language = 'zh' | 'en'

export interface Translations {
  // 导航
  nav: {
    home: string
    snake: string
    survivor: string
    leaderboard: string
    forum: string
  }
  
  // 首页
  home: {
    title: string
    description: string
    techStack: string
    features: {
      snake: {
        title: string
        description: string
      }
      survivor: {
        title: string
        description: string
      }
      leaderboard: {
        title: string
        description: string
      }
      forum: {
        title: string
        description: string
      }
    }
  }
  
  // 贪吃蛇游戏
  snake: {
    title: string
    description: string
    controls: string
    gameModes: {
      classic: string
      obstacle: string
      speed: string
    }
    specialFood: {
      speed: string
      double: string
      shield: string
    }
    stats: {
      score: string
      length: string
      level: string
      speed: string
    }
    gameOver: {
      title: string
      finalScore: string
      submitScore: string
      restart: string
      enterName: string
    }
    instructions: {
      title: string
      controls: string
      modes: string
      specialFood: string
      difficulty: string
    }
  }
  
  // 幸存者游戏
  survivor: {
    title: string
    description: string
    controls: string
    weapons: {
      whip: string
      magicWand: string
      fireball: string
      lightning: string
      iceSpike: string
    }
    stats: {
      score: string
      time: string
      health: string
    }
    gameOver: {
      title: string
      finalScore: string
      survivalTime: string
      submitScore: string
      restart: string
      enterName: string
    }
    instructions: {
      title: string
      controls: string
      weapons: string
    }
  }
  
  // 排行榜
  leaderboard: {
    title: string
    allGames: string
    snake: string
    survivor: string
    rank: string
    player: string
    score: string
    gameType: string
    date: string
  }
  
  // 论坛
  forum: {
    title: string
    newPost: string
    search: string
    searchPlaceholder: string
    noPosts: string
    post: {
      author: string
      date: string
      comments: string
      like: string
      share: string
      copyLink: string
    }
    comment: {
      placeholder: string
      submit: string
    }
    pagination: {
      previous: string
      next: string
      page: string
      of: string
    }
  }
  
  // 通用
  common: {
    submit: string
    cancel: string
    loading: string
    error: string
    success: string
    timeAgo: {
      justNow: string
      minutesAgo: string
      hoursAgo: string
      daysAgo: string
    }
  }
}

export const translations: Record<Language, Translations> = {
  zh: {
    nav: {
      home: '首页',
      snake: '贪吃蛇',
      survivor: '幸存者',
      leaderboard: '排行榜',
      forum: '社区论坛'
    },
    home: {
      title: '我的个人网站',
      description: '欢迎来到我的个人网站！这里展示了我使用现代Web技术构建的全栈项目。',
      techStack: '这个网站使用 Next.js + TypeScript + Tailwind CSS 构建，后端使用 PostgreSQL 云数据库存储游戏分数。',
      features: {
        snake: {
          title: '🐍 贪吃蛇',
          description: '经典贪吃蛇游戏，支持多种模式、特殊食物和难度曲线。'
        },
        survivor: {
          title: '⚔️ 幸存者',
          description: '类似吸血鬼幸存者的生存游戏，多种武器和敌人。'
        },
        leaderboard: {
          title: '🏆 排行榜',
          description: '查看所有游戏的最高分数记录。'
        },
        forum: {
          title: '💬 社区论坛',
          description: '分享想法、讨论游戏策略的社区空间。'
        }
      }
    },
    snake: {
      title: '🐍 贪吃蛇游戏',
      description: '使用方向键或WASD控制蛇的移动，吃到食物可以增长身体和获得分数！',
      controls: '使用方向键或WASD移动，空格键暂停',
      gameModes: {
        classic: '经典模式',
        obstacle: '障碍模式',
        speed: '极速模式'
      },
      specialFood: {
        speed: '加速',
        double: '双倍分数',
        shield: '护盾'
      },
      stats: {
        score: '分数',
        length: '长度',
        level: '等级',
        speed: '速度'
      },
      gameOver: {
        title: '游戏结束',
        finalScore: '最终分数',
        submitScore: '提交分数',
        restart: '重新开始',
        enterName: '请输入你的名字'
      },
      instructions: {
        title: '游戏说明',
        controls: '控制方式',
        modes: '游戏模式',
        specialFood: '特殊食物',
        difficulty: '难度曲线'
      }
    },
    survivor: {
      title: '⚔️ 幸存者游戏',
      description: '使用 WASD 或方向键移动，自动攻击敌人，生存越久分数越高！',
      controls: '使用 WASD 或方向键移动，自动攻击敌人',
      weapons: {
        whip: '鞭子',
        magicWand: '魔法杖',
        fireball: '火球术',
        lightning: '闪电链',
        iceSpike: '冰锥'
      },
      stats: {
        score: '分数',
        time: '时间',
        health: '生命'
      },
      gameOver: {
        title: '游戏结束',
        finalScore: '最终分数',
        survivalTime: '生存时间',
        submitScore: '提交分数',
        restart: '重新开始',
        enterName: '请输入你的名字'
      },
      instructions: {
        title: '游戏说明',
        controls: '控制方式',
        weapons: '武器系统'
      }
    },
    leaderboard: {
      title: '🏆 排行榜',
      allGames: '全部游戏',
      snake: '🐍 贪吃蛇',
      survivor: '⚔️ 幸存者',
      rank: '排名',
      player: '玩家',
      score: '分数',
      gameType: '游戏类型',
      date: '日期'
    },
    forum: {
      title: '💬 社区论坛',
      newPost: '发布新帖子',
      search: '搜索',
      searchPlaceholder: '搜索帖子标题、内容或作者...',
      noPosts: '暂无帖子',
      post: {
        author: '作者',
        date: '日期',
        comments: '条评论',
        like: '点赞',
        share: '分享',
        copyLink: '复制链接'
      },
      comment: {
        placeholder: '写下你的评论...',
        submit: '发表评论'
      },
      pagination: {
        previous: '上一页',
        next: '下一页',
        page: '第',
        of: '页，共'
      }
    },
    common: {
      submit: '提交',
      cancel: '取消',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      timeAgo: {
        justNow: '刚刚',
        minutesAgo: '分钟前',
        hoursAgo: '小时前',
        daysAgo: '天前'
      }
    }
  },
  en: {
    nav: {
      home: 'Home',
      snake: 'Snake',
      survivor: 'Survivor',
      leaderboard: 'Leaderboard',
      forum: 'Forum'
    },
    home: {
      title: 'My Personal Website',
      description: 'Welcome to my personal website! Here showcases my full-stack project built with modern web technologies.',
      techStack: 'This website is built with Next.js + TypeScript + Tailwind CSS, with PostgreSQL cloud database for storing game scores.',
      features: {
        snake: {
          title: '🐍 Snake Game',
          description: 'Classic snake game with multiple modes, special food, and difficulty curve.'
        },
        survivor: {
          title: '⚔️ Survivor',
          description: 'Vampire Survivors-like survival game with multiple weapons and enemies.'
        },
        leaderboard: {
          title: '🏆 Leaderboard',
          description: 'View the highest scores for all games.'
        },
        forum: {
          title: '💬 Community Forum',
          description: 'A community space to share ideas and discuss game strategies.'
        }
      }
    },
    snake: {
      title: '🐍 Snake Game',
      description: 'Use arrow keys or WASD to control the snake, eat food to grow and score points!',
      controls: 'Use arrow keys or WASD to move, spacebar to pause',
      gameModes: {
        classic: 'Classic Mode',
        obstacle: 'Obstacle Mode',
        speed: 'Speed Mode'
      },
      specialFood: {
        speed: 'Speed Boost',
        double: 'Double Score',
        shield: 'Shield'
      },
      stats: {
        score: 'Score',
        length: 'Length',
        level: 'Level',
        speed: 'Speed'
      },
      gameOver: {
        title: 'Game Over',
        finalScore: 'Final Score',
        submitScore: 'Submit Score',
        restart: 'Restart',
        enterName: 'Enter your name'
      },
      instructions: {
        title: 'Game Instructions',
        controls: 'Controls',
        modes: 'Game Modes',
        specialFood: 'Special Food',
        difficulty: 'Difficulty Curve'
      }
    },
    survivor: {
      title: '⚔️ Survivor Game',
      description: 'Use WASD or arrow keys to move, automatically attack enemies, survive longer for higher scores!',
      controls: 'Use WASD or arrow keys to move, auto-attack enemies',
      weapons: {
        whip: 'Whip',
        magicWand: 'Magic Wand',
        fireball: 'Fireball',
        lightning: 'Lightning',
        iceSpike: 'Ice Spike'
      },
      stats: {
        score: 'Score',
        time: 'Time',
        health: 'Health'
      },
      gameOver: {
        title: 'Game Over',
        finalScore: 'Final Score',
        survivalTime: 'Survival Time',
        submitScore: 'Submit Score',
        restart: 'Restart',
        enterName: 'Enter your name'
      },
      instructions: {
        title: 'Game Instructions',
        controls: 'Controls',
        weapons: 'Weapon System'
      }
    },
    leaderboard: {
      title: '🏆 Leaderboard',
      allGames: 'All Games',
      snake: '🐍 Snake',
      survivor: '⚔️ Survivor',
      rank: 'Rank',
      player: 'Player',
      score: 'Score',
      gameType: 'Game Type',
      date: 'Date'
    },
    forum: {
      title: '💬 Community Forum',
      newPost: 'New Post',
      search: 'Search',
      searchPlaceholder: 'Search posts by title, content, or author...',
      noPosts: 'No posts found',
      post: {
        author: 'Author',
        date: 'Date',
        comments: 'comments',
        like: 'Like',
        share: 'Share',
        copyLink: 'Copy Link'
      },
      comment: {
        placeholder: 'Write your comment...',
        submit: 'Post Comment'
      },
      pagination: {
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        of: 'of'
      }
    },
    common: {
      submit: 'Submit',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      timeAgo: {
        justNow: 'Just now',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago',
        daysAgo: 'days ago'
      }
    }
  }
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('zh')
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])
  
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }
  
  return { language, changeLanguage, t: translations[language] }
} 