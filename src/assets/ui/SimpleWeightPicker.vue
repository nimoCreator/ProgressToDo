<template>
    <SimpleFieldButton icon="balance">
        <input type="number" v-model="value" />
    </SimpleFieldButton>
</template>

<script>
import SimpleFieldButton from '@/assets/ui/SimpleFieldButton.vue';

export default {
    name: 'SimpleWeightPicker',
    components: { SimpleFieldButton },
    props: {
        modelValue: { required: true },
    },
    emits: ['update:modelValue'],
    computed: {
        value: {
            get() { return this.modelValue; },
            set(v) { this.$emit('update:modelValue', v); },
        },
    },
};
</script>
