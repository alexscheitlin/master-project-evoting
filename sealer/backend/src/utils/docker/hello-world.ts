import Docker from 'dockerode'

export const helloWorld = () => {
  console.log('inside helloWorld')

  const docker = new Docker()

  function runHelloWorld() {
    //@ts-ignore
    docker.run('hello-world', [], process.stdout).then(res => {
      const container = res[1]
    })
  }

  docker.pull('hello-world', {}).then((data: any) => {
    runHelloWorld()
  })
}
