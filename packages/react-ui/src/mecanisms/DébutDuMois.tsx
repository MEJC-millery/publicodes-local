import { EvaluatedNode } from 'publicodes'
import DefaultInlineMecanism from './common/DefaultInlineMecanism'

export default function MecanismDébutDuMois(node: EvaluatedNode<"début du mois">) {
	return (
		<DefaultInlineMecanism
			{...node}
			sourceMap={{
				mecanismName: node.nodeKind,
				args: { valeur: node.explanation },
			}}
		/>
	)
}
