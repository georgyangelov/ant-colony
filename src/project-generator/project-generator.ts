import glob from 'glob';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs';

export interface ProjectGeneratorConfig {
  templateDir: string;
  destinationDir: string;

  parameters: {
    antColonyVersion: string;
  };
}

export class ProjectGenerator {
  constructor(private config: ProjectGeneratorConfig) {}

  generate() {
    fs.mkdirSync(this.config.destinationDir, { recursive: true });

    if (!this.isDestinationDirEmpty()) {
      console.error('Destination directory is not empty');
      return;
    }

    this.plopFiles();

    console.info();
    console.info(`New project was created in ${this.config.destinationDir}`);
    console.info();
    console.info('You can now:');
    console.info('  0. `cd` into the new directory');
    console.info('  1. Install dependencies with `npm install`');
    console.info('  2. Explore the generated files and directories');
    console.info('  3. Run the example script using `npm start`');
    console.info(
      '  4. Optionally configure your AWS credentials and run `npm run start:serverless`'
    );
    console.info();
    console.info(
      'For more info read the generated project README.md or visit https://github.com/georgyangelov/ant-colony'
    );
  }

  private isDestinationDirEmpty() {
    const files = glob.sync('*', {
      cwd: path.resolve(this.config.destinationDir),
      absolute: false,
      dot: true,
      strict: true
    });

    return files.length === 0;
  }

  private plopFiles() {
    const filesToPlop = glob.sync('**/*', {
      cwd: path.resolve(this.config.templateDir),
      absolute: false,
      dot: true,
      strict: true,
      nodir: true
    });

    filesToPlop.forEach(templateFilePath => {
      const templateFileAbsolutePath = path.resolve(
        this.config.templateDir,
        templateFilePath
      );
      const destFilePath = path
        .resolve(this.config.destinationDir, templateFilePath)
        .replace(/\.ejs/, '');

      const templateContent = fs.readFileSync(templateFileAbsolutePath, {
        encoding: 'utf-8'
      });

      const fileContent: string = templateFilePath.endsWith('.ejs')
        ? this.renderEjs(templateContent)
        : templateContent;

      fs.mkdirSync(path.dirname(destFilePath), { recursive: true });
      fs.writeFileSync(destFilePath, fileContent, { encoding: 'utf-8' });

      console.info(`Created ${templateFilePath.replace(/\.ejs/, '')}`);
    });
  }

  private renderEjs(template: string) {
    return ejs.render(template, this.config.parameters, {
      async: false,
      escape: undefined
    });
  }
}
