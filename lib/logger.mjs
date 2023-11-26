import chalk from 'chalk'

export function logger(namespace) {
  const color = logger.colors.next().value

  return {
    trace: (...args) => {
      if (logger.level >= 5) console.trace(chalk[color](namespace), ...args)
    },
    debug: (...args) => {
      if (logger.level >= 4) console.debug(chalk[color](namespace), ...args)
    },
    info: (...args) => {
      if (logger.level >= 3) console.info(chalk[color](namespace), ...args)
    },
    warn: (...args) => {
      if (logger.level >= 2) console.warn(chalk[color](namespace), ...args)
    },
    error: (...args) => {
      if (logger.level >= 1) console.error(chalk[color](namespace), ...args)
    },
    fatal: (...args) => {
      if (logger.level >= 0) console.error(chalk[color](namespace), ...args)
    },
    always: (...args) => {
      console.log(chalk[color](namespace), ...args)
    },
  }
}

logger.colorWheel = function*() {
  const colors = ['magenta', 'green', 'yellow', 'blue', 'cyan', 'red']

  let index = 0
  while (true) {
    yield colors[index++]
    if (index > colors.length - 1) index = 0
  }
}

logger.colors = logger.colorWheel()
logger.level = 3
