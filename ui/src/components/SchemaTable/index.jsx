import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import RefParser from 'json-schema-ref-parser';
import { string, object, oneOf } from 'prop-types';
import { join } from 'path';
import Spinner from '@mozilla-frontend-infra/components/Spinner';
import { withStyles } from '@material-ui/core/styles';
import Table from 'react-schema-viewer/lib/SchemaTable';
import { THEME } from '../../utils/constants';
import urls from '../../utils/urls';
import references from '../../../docs/references.json';

@withRouter
@withStyles(
  theme => {
    const borderColor =
      theme.palette.type === 'dark'
        ? THEME.TEN_PERCENT_WHITE
        : THEME.TEN_PERCENT_BLACK;

    return {
      bootstrapTable: {
        fontSize: 16,
        overflowX: 'auto',
        '& pre': {
          background:
            theme.palette.type === 'dark'
              ? `${THEME.TEN_PERCENT_WHITE} !important`
              : `${THEME.TEN_PERCENT_BLACK} !important`,
        },
        /* eslint-disable no-dupe-keys */
        // Copied from https://github.com/twbs/bootstrap/blob/f7e8445f72875a49a909dc0af8e4cf43f19f535e/dist/css/bootstrap.css#L1515-L1536
        '& .table': {
          width: '100%',
          marginBottom: '1rem',
        },
        '& .table th, & .table td': {
          padding: '0.75rem',
          verticalAlign: 'top',
          borderTop: `1px solid ${borderColor}`,
        },
        '& .table thead th': {
          verticalAlign: 'bottom',
          borderBottom: `2px solid ${borderColor}`,
          '& table tbody + tbody': {
            borderTop: `2px solid ${borderColor}`,
          },
        },
        '& .table': {
          width: '100%',
          marginBottom: '1rem',
        },
        '& .table th, & .table td': {
          padding: '0.75rem',
          verticalAlign: 'top',
          borderTop: `1px solid ${borderColor}`,
        },
        '& .table thead th': {
          verticalAlign: 'bottom',
          borderBottom: `2px solid ${borderColor}`,
          '& table tbody + tbody': {
            borderTop: `2px solid ${borderColor}`,
          },
        },
        // Copied from https://github.com/twbs/bootstrap/blob/f7e8445f72875a49a909dc0af8e4cf43f19f535e/dist/css/bootstrap.css#L1547-L1559
        '& .table-bordered': {
          border: `1px solid ${borderColor}`,
        },
        '& .table-bordered th': {
          border: `1px solid ${borderColor}`,
        },
        '& .table-bordered thead th, & .table-bordered thead td': {
          borderBottomWidth: 2,
        },
        /* eslint-enable no-dupe-keys */
      },
    };
  },
  { withTheme: true }
)
/**
 * Display a SchemaTable
 */
export default class SchemaTable extends Component {
  static defaultProps = {
    schema: oneOf([string, object]).isRequired,
  };

  state = {
    schema: null,
  };

  async componentDidMount() {
    const { schema } = this.props;

    if (!this.state.schema && schema) {
      const schemaContent = await this.getSchemaContent(schema);

      this.setState({
        schema: schemaContent,
      });
    }
  }

  buildSchemaId(schemaId) {
    if (schemaId.startsWith('/')) {
      const [service, version, filename] = schemaId
        .replace(/^\/schemas\//, '')
        .split('/');

      return urls.schema(service, join(version, filename));
    }

    return schemaId;
  }

  sanitizeSchema(schema) {
    if (schema.$id) {
      return {
        ...schema,
        $id: this.buildSchemaId(schema.$id),
      };
    }

    return schema;
  }

  readReference(schemaPath) {
    return references.find(({ filename }) =>
      filename.endsWith(schemaPath.replace(/^\//, '').replace(/#$/, ''))
    );
  }

  async getSchemaContent(schemaPath) {
    const schemaRef = this.readReference(schemaPath);
    const schema = this.sanitizeSchema(schemaRef.content);

    await RefParser.dereference(schema.$id, schema, {
      resolve: {
        http: false,
        file: false,
        any: {
          order: 1,
          canRead: true,
          read: file => {
            const { pathname } = new URL(file.url);
            const schema = this.readReference(pathname);

            return schema.content;
          },
        },
      },
      dereference: {
        circular: 'ignore',
      },
    });

    return schema;
  }

  render() {
    const { classes, theme } = this.props;
    const { schema } = this.state;
    const headerBackground =
      theme.palette.type === 'light' ? 'rgb(240,240,240)' : 'rgb(43,57,69)';

    return schema ? (
      <div className={classes.bootstrapTable}>
        <Table headerBackgroundColor={headerBackground} schema={schema} />
      </div>
    ) : (
      <Spinner loading />
    );
  }
}
