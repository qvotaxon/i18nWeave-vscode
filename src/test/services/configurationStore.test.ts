import * as assert from 'assert';
import ConfigurationStore from '../../services/configurationStore';

suite('ConfigurationStore Tests', () => {
  test('get should return the value associated with the given key', () => {
    const store = new ConfigurationStore({ key: 'val' });

    const result = store.get('key');

    assert.strictEqual(result, 'val');
  });

  test('get should return undefined if the key does not exist', () => {
    const store = new ConfigurationStore({ key: 'val' });

    const result = store.get('baz' as keyof { key: string });

    assert.strictEqual(result, undefined);
  });

  test('set should update the value associated with the given key', () => {
    const store = new ConfigurationStore({ key: 'val' });

    store.set('key', 'baz');

    const result = store.get('key');
    assert.strictEqual(result, 'baz');
  });

  test('update should merge the given options with the existing options', () => {
    const store = new ConfigurationStore({ key: 'val', key2: 'val2' });

    store.update({ key2: 'updatedVal2' });

    const result1 = store.get('key');
    const result2 = store.get('key2');
    assert.strictEqual(result1, 'val');
    assert.strictEqual(result2, 'updatedVal2');
  });
});
